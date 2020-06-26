(function() {
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
console.log("Connection!");
console.log(connection);

connection.socketURL = '/';
// connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

connection.extra.userFullName = params.userFullName;


/// make this room public
connection.publicRoomIdentifier = params.publicRoomIdentifier;

connection.socketMessageEvent = 'canvas-dashboard-demo';

// keep room opened even if owner leaves
connection.autoCloseEntireSession = false;

// https://www.rtcmulticonnection.org/docs/maxParticipantsAllowed/
connection.maxParticipantsAllowed = 1000;
// set value 2 for one-to-one connection
// connection.maxParticipantsAllowed = 2;
console.log(connection);

// here goes canvas designer
var designer = new CanvasDesigner();
console.log("designer!");

// you can place widget.html anywhere
designer.widgetHtmlURL = './canvas/widget.html';
designer.widgetJsURL = './widget.js';

// setInterval(designer.clearCanvas, 1000)

designer.appendTo(document.body || document.documentElement, function() {
});

designer.addSyncListener(function(data){
    console.log(data);
    console.log(data);

})
console.log(designer)

designer.icons.pencil = '/dashboard/img/pen.png'
designer.icons.marker = '/dashboard/img/pen2.png'
designer.icons.eraser = '/dashboard/img/eraser.png'
designer.icons.clearCanvas = '/dashboard/img/refresh.png'

designer.addSyncListener(function(data) {
    connection.send(data);
});


designer.setTools({
    pencil: true,
    text: true,
    image: true,
    pdf: true,
    eraser: true,
    line: false,
    arrow: false,
    dragSingle: false,
    dragMultiple: false,
    arc: false,
    rectangle: false,
    quadratic: false,
    bezier: false,
    marker: true,
    zoom: false,
    lineWidth: false,
    colorsPicker: false,
    clearCanvas: true,
    code: false,
    undo: true,
});

// here goes RTCMultiConnection

connection.chunkSize = 16000;
connection.enableFileSharing = true;

connection.session = {
    audio: true,
    video: true,
    data: true,
    screen:false
};
connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};

connection.onUserStatusChanged = function(event) {
    console.log("onUserStatusChanged!");
    var infoBar = document.getElementById('onUserStatusChanged');
    var names = [];

    connection.getAllParticipants().forEach(function(pid) {
        names.push(getFullName(pid));
    });

    if (!names.length) {
        $("#nos").text("0");

    } else {
        $("#nos").text(names.length);
    }

    SetStudentList();
};

connection.onopen = function(event) {
    console.log("onopen!");
    connection.onUserStatusChanged(event);

    if (designer.pointsLength <= 0) {
        setTimeout(function() {
            connection.send('plz-sync-points');
        }, 1000);
    }

    document.getElementById('btn-attach-file').style.display = 'inline-block';
    document.getElementById('top_share_screen').style.display = 'inline-block';
};

connection.onclose = connection.onerror = connection.onleave = function(event) {
    console.log("on close!");
    connection.onUserStatusChanged(event);
};

connection.onmessage = function(event) {
    if(event.data.showMainVideo) {
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

    if(event.data.hideMainVideo) {
        // $('#main-video').hide();
        $('#screen-viewer').hide();
        return;
    }


    if(event.data.typing === false) {
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

    designer.syncData(event.data);
};

// extra code

connection.onstream = function(event) {
    console.log("onstream!");
    if (event.stream.isScreen && !event.stream.canvasStream) {
        $('#screen-viewer').get(0).srcObject = event.stream;
        $('#screen-viewer').hide();
    }
    else if (event.extra.roomOwner === true) {
        var video = document.getElementById('main-video');
        video.setAttribute('data-streamid', event.streamid);
        // video.style.display = 'none';
        if(event.type === 'local') {
            video.muted = true;
            video.volume = 0;
        }
        video.srcObject = event.stream;
        // $('#main-video').show();
    } else {
        // 타 사용자 캠 표시 막기
        // event.mediaElement.controls = false;
        // var otherVideos = document.querySelector('#other-videos');
        // otherVideos.appendChild(event.mediaElement);
    }

    connection.onUserStatusChanged(event);
};

connection.setUserPreferences = function(userPreferences) {
    if (connection.dontAttachStream) {
    	// current user's streams will NEVER be shared with any other user
        userPreferences.dontAttachLocalStream = true;
    }

    if (connection.dontGetRemoteStream) {
    	// current user will NEVER receive any stream from any other user
        userPreferences.dontGetRemoteStream = true;
    }

    return userPreferences;
};

connection.onstreamended = function(event) {
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
        focus: function() {
            $('.emojionearea-category').unbind('click').bind('click', function() {
                $('.emojionearea-button-close').click();
            });
        },

        keyup: function(e) {
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

window.onkeyup = function(e) {
    var code = e.keyCode || e.which;
    if (code == 13) {
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
    }
};

var recentFile;
document.getElementById('btn-attach-file').onclick = function() {
    var file = new FileSelector();
    file.selectSingleFile(function(file) {
        recentFile = file;

        if(connection.getAllParticipants().length >= 1) {
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

connection.onFileEnd = function(file) {
    var html = getFileHTML(file);
    var div = progressHelper[file.uuid].div;

    if (file.userid === connection.userid) {
        div.innerHTML = '<b>You:</b><br>' + html;
        div.style.background = '#cbffcb';

        if(recentFile) {
            recentFile.userIndex++;
            var nextUserId = connection.getAllParticipants()[recentFile.userIndex];
            if(nextUserId) {
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

connection.onFileProgress = function(chunk, uuid) {
    var helper = progressHelper[chunk.uuid];
    helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
    updateLabel(helper.progress, helper.label);
};

connection.onFileStart = function(file) {
    var div = document.createElement('div');
    div.className = 'message';

    if (file.userid === connection.userid) {
        var userFullName = file.remoteUserId;
        if(connection.peersBackup[file.remoteUserId]) {
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

if(!!params.password) {
    connection.password = params.password;
}

designer.appendTo(document.getElementById('widget-container'), function() {
    console.log("designer append");
    if (params.open === true || params.open === 'true') {
        console.log("Opening Class!");
            var tempStreamCanvas = document.getElementById('temp-stream-canvas');
            var tempStream = tempStreamCanvas.captureStream();
            tempStream.isScreen = true;
            tempStream.streamid = tempStream.id;
            tempStream.type = 'local';
            connection.attachStreams.push(tempStream);
            window.tempStream = tempStream;

            SetTeacher();

            connection.extra.roomOwner = true;
            connection.open(params.sessionid, function(isRoomOpened, roomid, error) {
                if (error) {
                    if (error === connection.errors.ROOM_NOT_AVAILABLE) {
                        alert('이미 존재하는 방 번호입니다.');
                        return;
                    }
                    alert(error);
                }

                connection.socket.on('disconnect', function() {
                    location.reload();
                });
            });
    } else {
        console.log("try joining!");
        connection.DetectRTC.load(function() { 
            SetStudent();

            if (!connection.DetectRTC.hasMicrophone) {
                connection.mediaConstraints.audio = false;
                connection.session.audio = false;
                console.log("user has no mic!");
                alert("마이크가 없습니다!");
            }
        
            if (!connection.DetectRTC.hasWebcam) {
                connection.mediaConstraints.video = false;
                connection.session.video = false;
                console.log("user has no cam!");
                alert("캠이 없습니다!");
                connection.session.oneway = true;
                connection.sdpConstraints.mandatory = {
                    OfferToReceiveAudio: false,
                    OfferToReceiveVideo: false
                };
    
            }
        });
    
        connection.join({sessionid:params.sessionid,
                         userid: connection.channel,
                         session: connection.session}, function(isRoomJoined, roomid, error) {
            console.log("Joing Class!");
            if (error) {
                console.log("Joing Error!");
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
                    if(!connection.password.length) {
                        alert('Invalid password.');
                        return;
                    }
                    connection.join(params.sessionid, function(isRoomJoined, roomid, error) {
                        if(error) {
                            alert(error);
                        }
                    });
                    return;
                }
                alert(error);
            }

            connection.socket.on('disconnect', function() {
                console.log("disconnect Class!");
                location.reload();
            });
            console.log("isRoomJoined",isRoomJoined);
        });
    }
});

function addStreamStopListener(stream, callback) {
    stream.addEventListener('ended', function() {
        callback();
        callback = function() {};
    }, false);

    stream.addEventListener('inactive', function() {
        callback();
        callback = function() {};
    }, false);

    stream.getTracks().forEach(function(track) {
        track.addEventListener('ended', function() {
            callback();
            callback = function() {};
        }, false);

        track.addEventListener('inactive', function() {
            callback();
            callback = function() {};
        }, false);
    });
}

function replaceTrack(videoTrack, screenTrackId) {
    if (!videoTrack) return;
    if (videoTrack.readyState === 'ended') {
        alert('Can not replace an "ended" track. track.readyState: ' + videoTrack.readyState);
        return;
    }
    connection.getAllParticipants().forEach(function(pid) {
        var peer = connection.peers[pid].peer;
        if (!peer.getSenders) return;
        var trackToReplace = videoTrack;
        peer.getSenders().forEach(function(sender) {
            if (!sender || !sender.track) return;
            if(screenTrackId) {
                if(trackToReplace && sender.track.id === screenTrackId) {
                    sender.replaceTrack(trackToReplace);
                    trackToReplace = null;
                }
                return;
            }

            if(sender.track.id !== tempStream.getTracks()[0].id) return;
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
    addStreamStopListener(stream, function() {
        connection.send({
            hideMainVideo: true
        });

        // $('#main-video').hide();
        $('#screen-viewer').hide();
        $('#top_share_screen').show();
        replaceTrack(tempStream.getTracks()[0], screenTrackId);
    });

    stream.getTracks().forEach(function(track) {
        if(track.kind === 'video' && track.readyState === 'live') {
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

$('#top_share_screen').click(function() {
    if(!window.tempStream) {
        alert('Screen sharing is not enabled.');
        return;
    }
    screen_constraints = {
        screen: true,
        oneway: true
        };
    //$('#top_share_screen').hide();

    if(navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia(screen_constraints).then(stream => {
            replaceScreenTrack(stream);
        }, error => {
            alert('Please make sure to use Edge 17 or higher.');
        });
    }
    else if(navigator.getDisplayMedia) {
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



function TimeUpdate(){
    var date = new Date;
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    var hours = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    month += 1;
    if(month < 10)
        month = "0" + month;
    if(day < 10)
        day = "0" + day;
    if(hours < 10)
        hours = "0" + hours;
    if(min < 10)
        min = "0" + min;
    if(sec < 10)
        sec = "0" + sec;


    $("#current-day").text(year+'-'+month+'-'+day);
    $("#current-time").text(hours+':'+min+':'+sec);
}

setInterval(TimeUpdate,1000);

function SetTeacher(){
    $("#who-am-i").text("선생님");
    $('#session-id').text(connection.extra.userFullName+"("+params.sessionid+")");
    $("#my-name").remove();
    $(".for_teacher").show();
}

function SetStudent(){
    $("#who-am-i").text("학생");
    $('#session-id').text(connection.extra.userFullName+"("+params.sessionid+")");
    $("#my-name").text("학생 이름 : "+connection.extra.userFullName);
    $(".for_teacher").hide();
    $("#main-video").show();
    $("#top_all_controll").hide();
}

SelectViewType();

function SetStudentList(){
    $("#student_list").empty();

    if(connection.getAllParticipants().length == 0){
        $("#student_list").append('<span class="no_student"> 접속한 학생이 없습니다 </span>')
    }
    else {
        connection.getAllParticipants().forEach(function(pid) {
            $("#student_list").append('<span class="student">' +getFullName(pid) + '</span>')
        });
    }
}

function SelectViewType(){
    $(".view_type").click(function(){
        $(".view_type").removeClass("view_type-on");
        $(this).addClass("view_type-on");
        switch(this.id){
            case "view_student" :
                $("#main-video").hide();
                $("#student_list").show();
                break;
            case "vidw_cam" :
                $("#main-video").show();
                $("#student_list").hide();
                break;
            case "view_result" :
                $("#student_list").hide();
                $("#main-video").hide();
                break;
        }
    })
}

$("#icon_exit").click(function(){
    history.back();
})

$(window).on("beforeunload", function () {
    // return 1;
});


    // If absolute URL from the remote server is provided, configure the CORS
    // header on that server.
    var url = 'test.pdf';
    
    // Loaded via <script> tag, create shortcut to access PDF.js exports.
    var pdfjsLib = window['pdfjs-dist/build/pdf'];
    
    // The workerSrc property shall be specified.
    pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
    
    var pdfDoc = null,
        pageNum = 1,
        pageRendering = false,
        pageNumPending = null,
        scale = 1,
        canvas = document.getElementById('the-canvas'),
        ctx = canvas.getContext('2d');
    
    /**
     * Get page info from document, resize canvas accordingly, and render page.
     * @param num Page number.
     */
    function renderPage(num) {
      pageRendering = true;
      // Using promise to fetch the page
      pdfDoc.getPage(num).then(function(page) {
        var viewport = page.getViewport({scale: scale});
        canvas.height = viewport.height;
        canvas.width = viewport.width;
    
        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        var renderTask = page.render(renderContext);
    
        // Wait for rendering to finish
        renderTask.promise.then(function() {
          pageRendering = false;
          if (pageNumPending !== null) {
            // New page rendering is pending
            renderPage(pageNumPending);
            pageNumPending = null;
          }
        //   document.getElementById('the-canvas').style.zIndex = +1;
          const target = document.getElementById('the-canvas');
          window.frames[1].document.getElementsByClassName("design-surface")[0].appendChild(target);
          window.frames[1].document.getElementsByClassName("design-surface")[0].getElementById('main-canvas').style.zIndex = 2;
          window.frames[1].document.getElementsByClassName("design-surface")[0].getElementById('temp-canvas').style.zIndex = 1;
        });
      });
    
      // Update page counters
      document.getElementById('page_num').textContent = num;
    }
    
    /**
     * If another page rendering in progress, waits until the rendering is
     * finised. Otherwise, executes rendering immediately.
     */
    function queueRenderPage(num) {
      if (pageRendering) {
        pageNumPending = num;
      } else {
        renderPage(num);
      }
    }
    
    /**
     * Displays previous page.
     */
    function onPrevPage() {
      if (pageNum <= 1) {
        return;
      }
      pageNum--;
      queueRenderPage(pageNum);
    }
    document.getElementById('prev').addEventListener('click', onPrevPage);
    
    /**
     * Displays next page.
     */
    function onNextPage() {
      if (pageNum >= pdfDoc.numPages) {
        return;
      }
      pageNum++;
      queueRenderPage(pageNum);
    }
    document.getElementById('next').addEventListener('click', onNextPage);
    
    function closePDF() {
      console.log("close!");
      console.log(pdfDoc);
      pdfjsLib.destroy();
      document.removeAttribute.getElementById('the-canvas')
    }
    document.getElementById('close-pdf').addEventListener('click', closePDF);

    /**
     * Asynchronously downloads PDF.
     */
    pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
      pdfDoc = pdfDoc_;
      document.getElementById('page_count').textContent = pdfDoc.numPages;
    
      // Initial/first page rendering
      renderPage(pageNum);
    });    
    document.addEventListener('webviewerloaded', function() {
      PDFViewerApplicationOptions.set('printResolution', 300);
    });

document.getElementById('the-canvas').addEventListener('click', canvasClicked);

function canvasClicked() {
    console.log("Canvas Clicked!");

}

// window.frames[1].document.getElementsById('main-canvas').addEventListener('click', canvasClicked);