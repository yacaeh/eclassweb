(function () {
    var params = {},
        r = /([^&=]+)=?([^&]*)/g;

    function d(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    }
    var match, search = window.location.search;
    while (match = r.exec(search.substring(1)))
        params[d(match[1])] = d(match[2]);
    window.params = params;
})();

var connection = new RTCMultiConnection();

connection.socketURL = '/';
// connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

connection.extra.userFullName = params.userFullName;


/// make this room public
connection.publicRoomIdentifier = params.publicRoomIdentifier;

connection.socketMessageEvent = 'canvas-dashboard-demo';

// keep room opened even if owner leaves
connection.autoCloseEntireSession = true;

// https://www.rtcmulticonnection.org/docs/maxParticipantsAllowed/
connection.maxParticipantsAllowed = 1000;
// set value 2 for one-to-one connection
// connection.maxParticipantsAllowed = 2;

// here goes canvas designer
var designer = new CanvasDesigner();

// you can place widget.html anywhere
designer.widgetHtmlURL = '/node_modules/canvas-designer/widget.html';
designer.widgetJsURL = '/node_modules/canvas-designer/widget.min.js'

designer.addSyncListener(function (data) {
    connection.send(data);
});

designer.setSelected('pencil');

designer.setTools({
    pencil: true,
    text: true,
    image: true,
    pdf: true,
    eraser: true,
    line: true,
    arrow: true,
    dragSingle: true,
    dragMultiple: true,
    arc: true,
    rectangle: true,
    quadratic: false,
    bezier: true,
    marker: true,
    zoom: false,
    lineWidth: false,
    colorsPicker: false,
    extraOptions: false,
    code: false,
    undo: true
});

// here goes RTCMultiConnection

connection.chunkSize = 16000;
connection.enableFileSharing = true;

connection.session = {
    audio: true,
    video: true,
    data: true,
    screen: false
};
connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};

connection.onUserStatusChanged = function (event) {
    var names = [];

    connection.getAllParticipants().forEach(function (pid) {
        names.push(getFullName(pid));
    });

    if (!names.length) {
        $("#nos").text("0");
    } else {
        $("#nos").text(names.length);
    }

    SetStudentList();
};

connection.onopen = function (event) {
    connection.onUserStatusChanged(event);

    if (designer.pointsLength <= 0) {
        setTimeout(function () {
            connection.send('plz-sync-points');
        }, 1000);
    }

    document.getElementById('btn-chat-message').disabled = false;
    document.getElementById('btn-attach-file').style.display = 'inline-block';
    document.getElementById('top_share_screen').style.display = 'inline-block';
};

connection.onclose = connection.onerror = connection.onleave = function (event) {
    connection.onUserStatusChanged(event);
};

connection.onmessage = function (event) {
    if (event.data.showMainVideo) {
        // $('#main-video').show();
        $('#screen-viewer').css({
            top: $('#widget-container').offset().top,
            left: $('#widget-container').offset().left,
            width: $('#widget-container').width(),
            height: $('#widget-container').height()
        });
        $('#screen-viewer').show();
        return;
    }

    if (event.data.hideMainVideo) {
        // $('#main-video').hide();
        $('#screen-viewer').hide();
        return;
    }


    if (event.data.typing === false) {
        $('#key-press').hide().find('span').html('');
        return;
    }

    if (event.data.chatMessage) {
        appendChatMessage(event);
        return;
    }

    if (event.data.checkmark === 'received') {
        var checkmarkElement = document.getElementById(event.data.checkmark_id);
        if (checkmarkElement) {
            checkmarkElement.style.display = 'inline';
        }
        return;
    }

    if (event.data === 'plz-sync-points') {
        designer.sync();
        return;
    }

    if(event.data.exam) {
        receiveExamData(event.data.exam);
        return;
    }

    designer.syncData(event.data);
};

// extra code

connection.onstream = function (event) {
    console.log("onstream!");
    if (event.stream.isScreen && !event.stream.canvasStream) {
        $('#screen-viewer').get(0).srcObject = event.stream;
        $('#screen-viewer').hide();
    }
    else if (event.extra.roomOwner === true) {
        var video = document.getElementById('main-video');
        video.setAttribute('data-streamid', event.streamid);
        // video.style.display = 'none';
        if (event.type === 'local') {
            video.muted = true;
            video.volume = 0;
        }
        video.srcObject = event.stream;
        $('#main-video').show();
    } else {
        // 타 사용자 캠 표시 막기
        // event.mediaElement.controls = false;
        // var otherVideos = document.querySelector('#other-videos');
        // otherVideos.appendChild(event.mediaElement);
    }

    connection.onUserStatusChanged(event);
};

connection.onstreamended = function (event) {
    console.log("onstreameneded!");
    var video = document.querySelector('video[data-streamid="' + event.streamid + '"]');
    if (!video) {
        video = document.getElementById(event.streamid);
        if (video) {
            video.parentNode.removeChild(video);
            return;
        }
    }
    if (video) {
        video.srcObject = null;
        video.style.display = 'none';
    }

    SetStudentList();
};

var conversationPanel = document.getElementById('conversation-panel');

function appendChatMessage(event, checkmark_id) {
    var div = document.createElement('div');

    div.className = 'message';

    if (event.data) {
        div.innerHTML = '<b>' + (event.extra.userFullName || event.userid) + ':</b><br>' + event.data.chatMessage;

        if (event.data.checkmark_id) {
            connection.send({
                checkmark: 'received',
                checkmark_id: event.data.checkmark_id
            });
        }
    } else {
        div.innerHTML = '<b>나:</b> <img class="checkmark" id="' + checkmark_id + '" title="Received" src="https://www.webrtc-experiment.com/images/checkmark.png"><br>' + event;
        div.style.background = '#cbffcb';
    }

    conversationPanel.appendChild(div);

    conversationPanel.scrollTop = conversationPanel.clientHeight;
    conversationPanel.scrollTop = conversationPanel.scrollHeight - conversationPanel.scrollTop;
}

var keyPressTimer;
var numberOfKeys = 0;

$('#txt-chat-message').emojioneArea({
    pickerPosition: "top",
    filtersPosition: "bottom",
    tones: false,
    autocomplete: true,
    inline: true,
    hidePickerOnBlur: true,
    events: {
        focus: function () {
            $('.emojionearea-category').unbind('click').bind('click', function () {
                $('.emojionearea-button-close').click();
            });
        },

        keyup: function (e) {
            var chatMessage = $('.emojionearea-editor').html();
            if (!chatMessage || !chatMessage.replace(/ /g, '').length) {
                connection.send({
                    typing: false
                });
            }
            clearTimeout(keyPressTimer);
            numberOfKeys++;

            if (numberOfKeys % 3 === 0) {
                connection.send({
                    typing: true
                });
            }
        },
    }
});

window.onkeyup = function (e) {
    var code = e.keyCode || e.which;
    if (code == 13) {
        $('#btn-chat-message').click();
    }
};

document.getElementById('btn-chat-message').onclick = function () {
    var chatMessage = $('.emojionearea-editor').html();
    $('.emojionearea-editor').html('');

    if (!chatMessage || !chatMessage.replace(/ /g, '').length) return;

    var checkmark_id = connection.userid + connection.token();

    appendChatMessage(chatMessage, checkmark_id);

    connection.send({
        chatMessage: chatMessage,
        checkmark_id: checkmark_id
    });

    connection.send({ typing: false });
};

var recentFile;
document.getElementById('btn-attach-file').onclick = function () {
    var file = new FileSelector();
    file.selectSingleFile(function (file) {
        recentFile = file;

        if (connection.getAllParticipants().length >= 1) {
            recentFile.userIndex = 0;
            connection.send(file, connection.getAllParticipants()[recentFile.userIndex]);
        }
    });
};

function getFileHTML(file) {
    var url = file.url || URL.createObjectURL(file);
    var attachment = '<a href="' + url + '" target="_blank" download="' + file.name + '">Download: <b>' + file.name + '</b></a>';
    if (file.name.match(/\.jpg|\.png|\.jpeg|\.gif/gi)) {
        attachment += '<br><img crossOrigin="anonymous" src="' + url + '">';
    } else if (file.name.match(/\.wav|\.mp3/gi)) {
        attachment += '<br><audio src="' + url + '" controls></audio>';
    } else if (file.name.match(/\.pdf|\.js|\.txt|\.sh/gi)) {
        attachment += '<iframe class="inline-iframe" src="' + url + '"></iframe></a>';
    }
    return attachment;
}

function getFullName(userid) {
    var _userFullName = userid;
    if (connection.peers[userid] && connection.peers[userid].extra.userFullName) {
        _userFullName = connection.peers[userid].extra.userFullName;
    }
    return _userFullName;
}

connection.onFileEnd = function (file) {
    var html = getFileHTML(file);
    var div = progressHelper[file.uuid].div;

    if (file.userid === connection.userid) {
        div.innerHTML = '<b>You:</b><br>' + html;
        div.style.background = '#cbffcb';

        if (recentFile) {
            recentFile.userIndex++;
            var nextUserId = connection.getAllParticipants()[recentFile.userIndex];
            if (nextUserId) {
                connection.send(recentFile, nextUserId);
            }
            else {
                recentFile = null;
            }
        }
        else {
            recentFile = null;
        }
    } else {
        div.innerHTML = '<b>' + getFullName(file.userid) + ':</b><br>' + html;
    }
};

// to make sure file-saver dialog is not invoked.
connection.autoSaveToDisk = false;

var progressHelper = {};

connection.onFileProgress = function (chunk, uuid) {
    var helper = progressHelper[chunk.uuid];
    helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
    updateLabel(helper.progress, helper.label);
};

connection.onFileStart = function (file) {
    var div = document.createElement('div');
    div.className = 'message';

    if (file.userid === connection.userid) {
        var userFullName = file.remoteUserId;
        if (connection.peersBackup[file.remoteUserId]) {
            userFullName = connection.peersBackup[file.remoteUserId].extra.userFullName;
        }

        div.innerHTML = '<b>You (to: ' + userFullName + '):</b><br><label>0%</label> <progress></progress>';
        div.style.background = '#cbffcb';
    } else {
        div.innerHTML = '<b>' + getFullName(file.userid) + ':</b><br><label>0%</label> <progress></progress>';
    }

    div.title = file.name;
    conversationPanel.appendChild(div);
    progressHelper[file.uuid] = {
        div: div,
        progress: div.querySelector('progress'),
        label: div.querySelector('label')
    };
    progressHelper[file.uuid].progress.max = file.maxChunks;

    conversationPanel.scrollTop = conversationPanel.clientHeight;
    conversationPanel.scrollTop = conversationPanel.scrollHeight - conversationPanel.scrollTop;
};

function updateLabel(progress, label) {
    if (progress.position == -1) return;
    var position = +progress.position.toFixed(2).split('.')[1] || 100;
    label.innerHTML = position + '%';
}

if (!!params.password) {
    connection.password = params.password;
}

designer.appendTo(document.getElementById('widget-container'), function () {
    if (params.open === true || params.open === 'true') {
        var tempStreamCanvas = document.getElementById('temp-stream-canvas');
        var tempStream = tempStreamCanvas.captureStream();
        tempStream.isScreen = true;
        tempStream.streamid = tempStream.id;
        tempStream.type = 'local';
        connection.attachStreams.push(tempStream);
        window.tempStream = tempStream;

        SetTeacher();

        connection.extra.roomOwner = true;
        connection.open(params.sessionid, function (isRoomOpened, roomid, error) {
            if (error) {
                if (error === connection.errors.ROOM_NOT_AVAILABLE) {
                    alert('이미 존재하는 방 번호입니다.');
                    return;
                }
                alert(error);
            }

            connection.socket.on('disconnect', function () {
                location.reload();
            });
        });
    } else {
        connection.join(params.sessionid, function (isRoomJoined, roomid, error) {

            SetStudent();


            if (error) {
                if (error === connection.errors.ROOM_NOT_AVAILABLE) {
                    alert('This room does not exist. Please either create it or wait for moderator to enter in the room.');
                    return;
                }
                if (error === connection.errors.ROOM_FULL) {
                    alert('Room is full.');
                    return;
                }
                if (error === connection.errors.INVALID_PASSWORD) {
                    connection.password = prompt('Please enter room password.') || '';
                    if (!connection.password.length) {
                        alert('Invalid password.');
                        return;
                    }
                    connection.join(params.sessionid, function (isRoomJoined, roomid, error) {
                        if (error) {
                            alert(error);
                        }
                    });
                    return;
                }
                alert(error);
            }

            connection.socket.on('disconnect', function () {
                location.reload();
            });
        });
    }
});

function addStreamStopListener(stream, callback) {
    stream.addEventListener('ended', function () {
        callback();
        callback = function () { };
    }, false);

    stream.addEventListener('inactive', function () {
        callback();
        callback = function () { };
    }, false);

    stream.getTracks().forEach(function (track) {
        track.addEventListener('ended', function () {
            callback();
            callback = function () { };
        }, false);

        track.addEventListener('inactive', function () {
            callback();
            callback = function () { };
        }, false);
    });
}

function replaceTrack(videoTrack, screenTrackId) {
    if (!videoTrack) return;
    if (videoTrack.readyState === 'ended') {
        alert('Can not replace an "ended" track. track.readyState: ' + videoTrack.readyState);
        return;
    }
    connection.getAllParticipants().forEach(function (pid) {
        var peer = connection.peers[pid].peer;
        if (!peer.getSenders) return;
        var trackToReplace = videoTrack;
        peer.getSenders().forEach(function (sender) {
            if (!sender || !sender.track) return;
            if (screenTrackId) {
                if (trackToReplace && sender.track.id === screenTrackId) {
                    sender.replaceTrack(trackToReplace);
                    trackToReplace = null;
                }
                return;
            }

            if (sender.track.id !== tempStream.getTracks()[0].id) return;
            if (sender.track.kind === 'video' && trackToReplace) {
                sender.replaceTrack(trackToReplace);
                trackToReplace = null;
            }
        });
    });
}

function replaceScreenTrack(stream) {
    stream.isScreen = true;
    stream.streamid = stream.id;
    stream.type = 'local';

    // connection.attachStreams.push(stream);
    connection.onstream({
        stream: stream,
        type: 'local',
        streamid: stream.id,
        // mediaElement: video
    });

    var screenTrackId = stream.getTracks()[0].id;
    addStreamStopListener(stream, function () {
        connection.send({
            hideMainVideo: true
        });

        // $('#main-video').hide();
        $('#screen-viewer').hide();
        $('#top_share_screen').show();
        replaceTrack(tempStream.getTracks()[0], screenTrackId);
    });

    stream.getTracks().forEach(function (track) {
        if (track.kind === 'video' && track.readyState === 'live') {
            replaceTrack(track);
        }
    });

    connection.send({
        showMainVideo: true
    });

    // $('#main-video').show();
    $('#screen-viewer').css({
        top: $('#widget-container').offset().top,
        left: $('#widget-container').offset().left,
        width: $('#widget-container').width(),
        height: $('#widget-container').height()
    });
    $('#screen-viewer').show();
}

$('#top_share_screen').click(function () {
    if (!window.tempStream) {
        alert('Screen sharing is not enabled.');
        return;
    }
    screen_constraints = {
        screen: true,
        oneway: true
    };
    //$('#top_share_screen').hide();

    if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia(screen_constraints).then(stream => {
            replaceScreenTrack(stream);
        }, error => {
            alert('Please make sure to use Edge 17 or higher.');
        });
    }
    else if (navigator.getDisplayMedia) {
        navigator.getDisplayMedia(screen_constraints).then(stream => {
            replaceScreenTrack(stream);
        }, error => {
            alert('Please make sure to use Edge 17 or higher.');
        });
    }
    else {
        alert('getDisplayMedia API is not available in this browser.');
    }
});

console.log("success");

function TimeUpdate() {
    var date = new Date;
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    var hours = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    month += 1;
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    if (hours < 10)
        hours = "0" + hours;
    if (min < 10)
        min = "0" + min;
    if (sec < 10)
        sec = "0" + sec;


    $("#current-day").text(year + '-' + month + '-' + day);
    $("#current-time").text(hours + ':' + min + ':' + sec);
}

setInterval(TimeUpdate, 1000);



function SetTeacher() {
    $("#who-am-i").text("선생님");
    $('#session-id').text(connection.extra.userFullName + "(" + params.sessionid + ")");
    $("#my-name").remove();
    $(".for_teacher").show();
}

function SetStudent() {
    $("#who-am-i").text("학생");
    console.log(connection.extra)
    $('#session-id').text(connection.extra.userFullName + "(" + params.sessionid + ")");
    $("#my-name").text("학생 이름 : " + connection.extra.userFullName);
    $(".for_teacher").hide();
}

SelectViewType();

function SetStudentList() {
    $("#student_list").empty();
    connection.getAllParticipants().forEach(function (pid) {
        $("#student_list").append('<span class="student">' + getFullName(pid) + '</span>')
    });
}

function SelectViewType() {
    $(".view_type").click(function () {
        $(".view_type").css({
            color: 'rgb(129,129,129)',
            backgroundColor: '',
        })

        $(this).css({
            color: 'white',
            backgroundColor: 'rgb(129,129,129)'
        })

        switch (this.id) {
            case "view_student":
                $("#main-video").hide();
                $("#student_list").show();
                $("#exam-result").hide();
                break;
            case "vidw_cam":
                $("#main-video").show();
                $("#student_list").hide();
                $("#exam-result").hide();
                break;
            case "view_result":
                $("#student_list").hide();
                $("#main-video").hide();
                $("#exam-result").show();
                break;
        }
    })
}

$('#top_test').click(function () {
    if ($('#exam-board').is(':visible')) {
        $('#exam-board').hide();
    }
    else {
        // 선생님
        if (params.open === 'true') {
            $("#exam-omr").hide();
            $("#exam-setting-bar").show();
        }
        // 학생
        else {
            $("#exam-omr").show();
            $("#exam-setting-bar").hide();
        }
        $('#exam-board').show();
    }
});


var m_QuesCount = 0;    // 현재 문제수
var m_ExamTimerInterval;    // 시험 타이머 인터벌
var m_ExamTime; // 

var examObj = {
    questionCount : 0,
    currentExamTime : 0,
    examTime : 0,        // (minute)
    examAnswer : []      // question 정답
};

// 문제수 적용 (문제 n개 만들기)
$('#exam-setting-apply').click(function () {
    m_QuesCount = $('#exam-question-count').val();
    examObj.questionCount = m_QuesCount;
    var answerList = getQuestionAnswerList();
    $('#exam-qustion-list').html("");
    for (var i = 1; i <= m_QuesCount; i++) {
        apeendQuestion(i);
    }

    setQuestionAnswer(answerList);
});

// 문제 1개 추가
$('#exam-add-question').click(function () {
    apeendQuestion(++m_QuesCount);
    examObj.questionCount += 1;
    $('#exam-question-count').val(m_QuesCount);
});

// 시험 시작, 종료
$('#exam-start').toggle(function () {
    if (isNaN($('#exam-time').val())) {
        // TODO : 시간 설정하라고 알림
        $('#exam-start').click();
        return;
    } else {
        m_ExamTime = parseInt($('#exam-time').val() * 60);
    }

    var answerList = getQuestionAnswerList();

    $('#exam-start').attr('class', 'btn btn-danger');
    $('#exam-start').html('종료');

    sendExamStart ();

    m_ExamTimerInterval = setInterval(function () {
        m_ExamTime--;
        $('#exam-time').val(parseInt(m_ExamTime / 60) + ":" + m_ExamTime % 60);
        if (m_ExamTime <= 0)
            $('#exam-start').click();
    }, 1000);
    // TODO : 학생들에게 시험 시작을 알려줌

    showExamStateForm();
}, function () {
    $('#exam-start').attr('class', 'btn btn-primary');
    $('#exam-start').html('시작');
    clearInterval(m_ExamTimerInterval);
    sendExamEnd ();
    $('#exam-time').val(parseInt(m_ExamTime / 60))
    // TODO : 학생들에게 시험 종료 알려줌
});

// 시험 문제 상태(응답률) 폼 표시
function showExamStateForm(){
    $('#exam-state').show();
    var stateHtmlStr = "";
    for (var i = 1; i <= m_QuesCount; i++) {
        stateHtmlStr += `<span>${i}번</span><progress id="exam-state-progress-${i}" value="0" max="100"></progress><span id="exam-state-percent-${i}" >0%</span><br>`;
    }
    $('#exam-state').html(stateHtmlStr);
}

// 시험 문제 하나의 상태(응답률) 변경 / 형식 -> (문제번호, 문제응답률/학생수)
function setExamState(num, percent){
    $(`#exam-state-progress-${num}`).val(percent);
    $(`#exam-state-percent-${num}`).html(percent+"%");
}

// 문제 html에 하나 추가 (apeend)
function apeendQuestion(i) {
    question = `<div id='exam-question-${i}'>`

    question += `<span id='exam-question-text-${i}'>${i}: </span>`;

    for (var j = 1; j <= 5; j++) {
        question += `<label for='exam-question-${i}_${j}'>${j}번</label>`;
        question += `<input type='radio' id='exam-question-${i}_${j}' name='exam-question-${i}' value='${j}'> `;
    }

    question += `<button id='exam-question-delete-${i}' onclick='deleteQuestion(${i})' class='btn btn-primary'>-</button>`;

    question += `</div>`;
    $('#exam-qustion-list').append(question);
}

// 문제 하나 제거
function deleteQuestion(num) {
    var answerList = getQuestionAnswerList();
    m_QuesCount--;
    answerList.splice(num - 1, 1);
    $('#exam-qustion-list').html("");
    for (var i = 1; i <= m_QuesCount; i++) {
        apeendQuestion(i);
    }
    setQuestionAnswer(answerList);
    $('#exam-question-count').val(m_QuesCount);
}

// 문제 정답 불러오기
function getQuestionAnswerList() {
    var checkList = new Array();
    for (var i = 1; i <= m_QuesCount; i++) {
        checkList.push($(`input:radio[name='exam-question-${i}']:checked`).val());
    }
    return checkList;
}

// 문제 정답 세팅
function setQuestionAnswer(answerList) {
    for (let i = 1; i <= m_QuesCount; i++) {
        $(`input:radio[name='exam-question-${i}'][value=${answerList[i - 1]}]`).prop('checked', true);
    }    
    examObj.examAnswer = answerList;
}


var examObj = {
    isStart : false,
    questionCount : 0,
    currentExamTime : 0,
    examTime : 0,        // (minute)
    examAnswer : []      // question 정답
};



function receiveExamData (_data) {
    console.log(_data);
    if(_data.examAnswerList) {
        examObj.questionCount = _data.examAnswerList.questionCount;
    }
    else if(_data.examStart) {       
        let examStart = _data.examStart;
        examObj.isStart = true;
        examObj.examTime = examStart.examTime;
        examObj.currentExamTime = examStart.examTime;
        examObj.questionCount = examStart.questionCount;

        setStudentOMR (examObj.questionCount, examObj.examTime);
    }
    else if(_data.examEnd) {
        examObj.isStart = false;

    }else if (_data.examAnswerCheck) {

    }
};


function sendExamAnswerToStudents () {
    if(connection.extra.roomOwner === true) {        
        connection.send ({
           exam : {            
                examAnswerList : {
                    questionCount : examObj.questionCount,
                    // exameTime : examObj.exameTime
                }       
           }
        });
    }
}


function sendExamStart () {

    if(connection.extra.roomOwner)
    {        
        sendExamAnswerToStudents ();
        examObj.isStart = true;
        connection.send({
            exam: {
                examStart : {
                    examTime : examObj.examTime,
                    questionCount : examObj.questionCount
                }
            }
        });    
    }
}

function sendExamEnd () {
    if(connection.extra.roomOwner)
    {
        examObj.isStart = false;
        connection.send({
            exam: {
                examEnd : true
            }
        });
    }
}

function sendSelectExamAnswerToTeacher (_questionNumber, _selectNumber) {
    // 정답...    
    connection.send ({      
        exam : {  
            examAnswerCheck : {
                questionNumber : _questionNumber,
                seletNumber : _selectNumber            
            }
        }
    });
};

function receiveSelectExamAnswerFromStudent () {
    // 정답 통계
    if(connection.extra.roomOwner)
    {
        // exam.examAnswer
    }
};

// TODO: 선생님이 이 함수를 호출해줘야함
// 학생들 OMR 세팅 
function setStudentOMR(quesCount, examTime) {
    $("#exam-omr").show();
    $('#exam-board').show();

    $('#exam-omr').html("");
    question = "<div id='exam-student-timer'>0:0</div>"

    m_QuesCount = quesCount;
    for (var i = 1; i <= m_QuesCount; i++) {
        question += `<div id='exam-question-${i}' onchange='omrChange(${i})'>`

        question += `<span id='exam-question-text-${i}'>${i}: </span>`;

        for (var j = 1; j <= 5; j++) {
            question += `<label for='exam-question-${i}_${j}'>${j}번</label>`;
            question += `<input type='radio' id='exam-question-${i}_${j}' name='exam-question-${i}' value='${j}'> `;
        }

        question += `</div>`;
    }
    question += "<button onclick='submitOMR()' class='btn btn-primary'>시험제출</button>";
    $('#exam-omr').html(question);

    m_ExamTime = parseInt(examTime * 60);

    m_ExamTimerInterval = setInterval(function () {
        m_ExamTime--;
        $('#exam-student-timer').html(parseInt(m_ExamTime / 60) + ":" + m_ExamTime % 60);
        if (m_ExamTime <= 0)
            clearInterval(m_ExamTimerInterval);
    }, 1000);
}

// 학생 시험 OMR 제출
function submitOMR() {
    clearInterval(m_ExamTimerInterval);
    var studentOMR = getQuestionAnswerList();
    console.log(studentOMR);
    
    // TODO: 서버로 학생 시험 정보 전송

    $('#exam-omr').html("");
    $('#exam-board').hide();
}

// 학생 OMR이 변경됨
function omrChange(num){
    console.log(num + "번이 변경됨");
    
    // TODO: 서버로 학생 시험 정보 전송
}