(function () {
  var params = {},
    r = /([^&=]+)=?([^&]*)/g;

  function d(s) {
    return decodeURIComponent(s.replace(/\+/g, ' '));
  }
  var match,
    search = window.location.search;
  while ((match = r.exec(search.substring(1))))
    params[d(match[1])] = d(match[2]);
  window.params = params;
})();
var connection = new RTCMultiConnection();
console.log(connection);
console.log('Connection!');

// function printHarryPotter(){ console.log("Harry Potter!"); }
// function printDawnOfDead(){ console.log("Dawn Of Dead!"); }
// module.exports.HarryPotter = printHarryPotter;
// module.exports.DawnOfDead = printDawnOfDead;​

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

// you can place widget.html anywhere
designer.widgetHtmlURL = './canvas/widget.html';
designer.widgetJsURL = './widget.js';

// setInterval(designer.clearCanvas, 1000)

designer.icons.pencil = '/dashboard/newimg/pen.png';
designer.icons.marker = '/dashboard/newimg/pen2.png';
designer.icons.eraser = '/dashboard/newimg/eraser.png';
designer.icons.clearCanvas = '/dashboard/newimg/trash.png';
designer.icons.pdf = '/dashboard/img/iconfinder_File.png';
designer.icons.on = '/dashboard/img/view_on.png';
designer.icons.off = '/dashboard/img/view_off.png';

console.log(designer.icons);

designer.addSyncListener(function (data) {
  connection.send(data);
});

designer.setTools({
  pencil: true,
  text: true,
  image: true,
  pdf: false,
  eraser: true,
  line: true,
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
  onoff: true,
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
  screen: false,
};
connection.sdpConstraints.mandatory = {
  OfferToReceiveAudio: true,
  OfferToReceiveVideo: true,
};

connection.onUserStatusChanged = function (event) {   
    var infoBar = document.getElementById('onUserStatusChanged');
    var names = [];

connection.getAllParticipants().forEach(function (pid) {
    names.push(getFullName(pid));
});

  if (!names.length) {
    $('#nos').text('0');
  } else {
    $('#nos').text(names.length);
  }

  SetStudentList();
};


connection.onopen = function (event) {
  console.log('onopen!');
  connection.onUserStatusChanged(event);

  if (designer.pointsLength <= 0) {
    setTimeout(function () {
      connection.send('plz-sync-points');
    }, 1000);
  }

    document.getElementById('top_attach-file').style.display = 'inline-block';
    document.getElementById('top_share_screen').style.display = 'inline-block';

    // 접속시 방정보 동기화.
    if(connection.extra.roomOwner)
        classroomCommand.sendsyncRoomInfo ();
};

connection.onclose = connection.onerror = connection.onleave = function (
  event
) {
  console.log('on close!');
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


    if (null != event.data.allControl) {
        if (/*!checkRoomOwner()*/true) {
            classroomInfo.allControl = event.data.allControl;
            
            if (event.data.allControl) {
                // 제어 하기    
                allControllEnable(top_all_controll_jthis,true,false);        
            }
            else {
                // 제어 풀기
                allControllEnable(top_all_controll_jthis,false,false);       
                
            }
        }
        return;
    }
    
    if(event.data.alert) {     
        classroomCommand.receivAlert ();    
        return;    
    }

    if(event.data.alertResponse) {     
        classroomCommand.receiveAlertResponse (event.data.alertResponse);
        return;
    };

    if (event.data.exam) {
        // 시험치기..        
        examObj.receiveExamData(event.data.exam);
        return;
    }


    if(event.data.roomSync) {
        console.log('event.data.roomSync');;
        classroomCommand.receiveSyncRoomInfo (event.data.roomSync);
        return;
    };

    //3d 모델링 Enable
    if(event.data.modelEnable)
    {
        console.log(event.data.modelEnable);

        
        var enable = event.data.modelEnable.enable;
        modelEnable(top_3d_render_jthis, enable , false);
        return;

    }

  if (event.data === 'plz-sync-points') {
    designer.sync();
    return;
  }

  if (null != event.data.allControl) {
    if (/*!checkRoomOwner()*/ true) {
      classroomInfo.allControl = event.data.allControl;

      if (event.data.allControl) {
        // 제어 하기
        allControllEnable(top_all_controll_jthis, true, false);
      } else {
        // 제어 풀기
        allControllEnable(top_all_controll_jthis, false, false);
      }
    }
    return;
  }

  if (event.data.alert) {
    classroomInfo.alert.receivAlert();
    return;
  }

  if (event.data.alertResponse) {
    classroomInfo.alert.receiveAlertResponse(event.data.alertResponse);
    return;
  }

  if (event.data.exam) {
    // 시험치기..
    examObj.receiveExamData(event.data.exam);
    return;
  }

  if (event.data.examAnswer) {
  }

  //3d 모델링 Enable
  if (event.data.modelEnable) {
    console.log(event.data.modelEnable);

    var enable = event.data.modelEnable.enable;
    modelEnable(top_3d_render_jthis, enable, false);
    return;
  }

  //3d 모델링 상대값
  if (event.data.ModelState) {
    console.log(event.data.ModelState);

    set3DModelStateData(
      event.data.ModelState.position,
      event.data.ModelState.rotation
    );
    return;
  }

  designer.syncData(event.data);
};

// extra code
connection.onstream = function (event) {
  console.log('onstream!');
  if (event.stream.isScreen && !event.stream.canvasStream) {
    $('#screen-viewer').get(0).srcObject = event.stream;
    $('#screen-viewer').hide();
  } else if (event.extra.roomOwner === true) {
    var video = document.getElementById('main-video');
    video.setAttribute('data-streamid', event.streamid);
    // video.style.display = 'none';
    if (event.type === 'local') {
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

connection.setUserPreferences = function (userPreferences) {
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

connection.onstreamended = function (event) {
  console.log('onstreameneded!');
  var video = document.querySelector(
    'video[data-streamid="' + event.streamid + '"]'
  );
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

    try {
        if(event.extra.roomOwner){
            var notice = document.getElementById("notice");

            var div2 = document.createElement('div');
            div2.innerHTML = "<b>" + event.data.chatMessage + "</b>";
            notice.appendChild(div2);
            notice.scrollTop = notice.clientHeight;
            notice.scrollTop = notice.scrollHeight - notice.scrollTop;

        }
    }
    catch{

    }

    if (event.data) {
        div.innerHTML = '<b>' + (event.extra.userFullName || event.userid) + ' : </b>' + event.data.chatMessage;

        if (event.data.checkmark_id) {
            connection.send({
                checkmark: 'received',
                checkmark_id: event.data.checkmark_id
            });
        }
    } else {
        div.innerHTML = '<b> 나 : </b>' + event;
        div.style.background = '#cbffcb';
    }

  conversationPanel.appendChild(div);

  conversationPanel.scrollTop = conversationPanel.clientHeight;
  conversationPanel.scrollTop =
    conversationPanel.scrollHeight - conversationPanel.scrollTop;
}

var keyPressTimer;
var numberOfKeys = 0;

$('#txt-chat-message').emojioneArea({
  pickerPosition: 'top',
  filtersPosition: 'bottom',
  tones: false,
  autocomplete: true,
  inline: true,
  hidePickerOnBlur: true,
  events: {
    focus: function () {
      $('.emojionearea-category')
        .unbind('click')
        .bind('click', function () {
          $('.emojionearea-button-close').click();
        });
    },

    keyup: function (e) {
      var chatMessage = $('.emojionearea-editor').html();
      if (!chatMessage || !chatMessage.replace(/ /g, '').length) {
        connection.send({
          typing: false,
        });
      }
      clearTimeout(keyPressTimer);
      numberOfKeys++;

      if (numberOfKeys % 3 === 0) {
        connection.send({
          typing: true,
        });
      }
    },
  },
});

window.onkeyup = function (e) {
  var code = e.keyCode || e.which;
  if (code == 13) {
    var chatMessage = $('.emojionearea-editor').html();
    $('.emojionearea-editor').html('');
    if (!chatMessage || !chatMessage.replace(/ /g, '').length) return;
    var checkmark_id = connection.userid + connection.token();
    appendChatMessage(chatMessage, checkmark_id);
    connection.send({
      chatMessage: chatMessage,
      checkmark_id: checkmark_id,
    });
    connection.send({ typing: false });
  }
};

var recentFile;
document.getElementById('top_attach-file').onclick = function () {
  var file = new FileSelector();
  file.selectSingleFile(function (file) {
    recentFile = file;

    if (connection.getAllParticipants().length >= 1) {
      recentFile.userIndex = 0;
      connection.send(
        file,
        connection.getAllParticipants()[recentFile.userIndex]
      );
    }
  });
};

function getFileHTML(file) {
  var url = file.url || URL.createObjectURL(file);
  var attachment =
    '<a href="' +
    url +
    '" target="_blank" download="' +
    file.name +
    '">Download: <b>' +
    file.name +
    '</b></a>';
  if (file.name.match(/\.jpg|\.png|\.jpeg|\.gif/gi)) {
    attachment += '<br><img crossOrigin="anonymous" src="' + url + '">';
  } else if (file.name.match(/\.wav|\.mp3/gi)) {
    attachment += '<br><audio src="' + url + '" controls></audio>';
  } else if (file.name.match(/\.pdf|\.js|\.txt|\.sh/gi)) {
    attachment +=
      '<iframe class="inline-iframe" src="' + url + '"></iframe></a>';
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
      } else {
        recentFile = null;
      }
    } else {
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
  helper.progress.value =
    chunk.currentPosition || chunk.maxChunks || helper.progress.max;
  updateLabel(helper.progress, helper.label);
};

connection.onFileStart = function (file) {
    var div = document.createElement('div');
    div.className = 'message';
  
    if (file.userid === connection.userid) {
      var userFullName = file.remoteUserId;
      if (connection.peersBackup[file.remoteUserId]) {
        userFullName =
          connection.peersBackup[file.remoteUserId].extra.userFullName;
      }
  
      div.innerHTML =
        '<b>You (to: ' +
        userFullName +
        '):</b><br><label>0%</label> <progress></progress>';
      div.style.background = '#cbffcb';
    } else {
      div.innerHTML =
        '<b>' +
        getFullName(file.userid) +
        ':</b><br><label>0%</label> <progress></progress>';
    }
  

  div.title = file.name;
  conversationPanel.appendChild(div);
  progressHelper[file.uuid] = {
    div: div,
    progress: div.querySelector('progress'),
    label: div.querySelector('label'),
  };
  progressHelper[file.uuid].progress.max = file.maxChunks;

  conversationPanel.scrollTop = conversationPanel.clientHeight;
  conversationPanel.scrollTop =
    conversationPanel.scrollHeight - conversationPanel.scrollTop;
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
  console.log('designer append');
  if (params.open === true || params.open === 'true') {
    console.log('Opening Class!');
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
    console.log('try joining!');
    connection.DetectRTC.load(function () {
      SetStudent();

      if (!connection.DetectRTC.hasMicrophone) {
        connection.mediaConstraints.audio = false;
        connection.session.audio = false;
        console.log('user has no mic!');
        alert('마이크가 없습니다!');
      }

      if (!connection.DetectRTC.hasWebcam) {
        connection.mediaConstraints.video = false;
        connection.session.video = false;
        console.log('user has no cam!');
        alert('캠이 없습니다!');
        connection.session.oneway = true;
        connection.sdpConstraints.mandatory = {
          OfferToReceiveAudio: false,
          OfferToReceiveVideo: false,
        };
      }
    });

    connection.join(
      {
        sessionid: params.sessionid,
        userid: connection.channel,
        session: connection.session,
      },
      function (isRoomJoined, roomid, error) {
        console.log('Joing Class!');
        if (error) {
          console.log('Joing Error!');
          if (error === connection.errors.ROOM_NOT_AVAILABLE) {
            alert(
              'This room does not exist. Please either create it or wait for moderator to enter in the room.'
            );
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
            connection.join(params.sessionid, function (
              isRoomJoined,
              roomid,
              error
            ) {
              if (error) {
                alert(error);
              }
            });
            return;
          }
          alert(error);
        }

        connection.socket.on('disconnect', function () {
          console.log('disconnect Class!');
          location.reload();
        });
        console.log('isRoomJoined', isRoomJoined);
      }
    );
  }
});

function addStreamStopListener(stream, callback) {
  stream.addEventListener(
    'ended',
    function () {
      callback();
      callback = function () {};
    },
    false
  );

  stream.addEventListener(
    'inactive',
    function () {
      callback();
      callback = function () {};
    },
    false
  );

  stream.getTracks().forEach(function (track) {
    track.addEventListener(
      'ended',
      function () {
        callback();
        callback = function () {};
      },
      false
    );

    track.addEventListener(
      'inactive',
      function () {
        callback();
        callback = function () {};
      },
      false
    );
  });
}

function replaceTrack(videoTrack, screenTrackId) {
  if (!videoTrack) return;
  if (videoTrack.readyState === 'ended') {
    alert(
      'Can not replace an "ended" track. track.readyState: ' +
        videoTrack.readyState
    );
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
      hideMainVideo: true,
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
    showMainVideo: true,
  });

  // $('#main-video').show();
  $('#screen-viewer').css({
    top: $('#widget-container').offset().top,
    left: $('#widget-container').offset().left,
    width: $('#widget-container').width(),
    height: $('#widget-container').height(),
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
    oneway: true,
  };
  //$('#top_share_screen').hide();

  if (navigator.mediaDevices.getDisplayMedia) {
    navigator.mediaDevices.getDisplayMedia(screen_constraints).then(
      (stream) => {
        replaceScreenTrack(stream);
      },
      (error) => {
        alert('Please make sure to use Edge 17 or higher.');
      }
    );
  } else if (navigator.getDisplayMedia) {
    navigator.getDisplayMedia(screen_constraints).then(
      (stream) => {
        replaceScreenTrack(stream);
      },
      (error) => {
        alert('Please make sure to use Edge 17 or higher.');
      }
    );
  } else {
    alert('getDisplayMedia API is not available in this browser.');
  }
});

function ClassTime() {
  var now = 0;
  function Sec() {
    now++;
    var time = now;

    var hour = Math.floor(time / 3600);
    time %= 3600;

    var min = Math.floor(time / 60);
    time %= 60;

    if (min < 10) min = '0' + min;

    if (time < 10) time = '0' + time;

    $('#current-day').text(hour + ':' + min + ':' + time);
  }
  setInterval(Sec, 1000);
}

ClassTime();




function SetTeacher(){
    $('#session-id').text(connection.extra.userFullName+" ("+params.sessionid+")");
    $("#my-name").remove();
    $(".for_teacher").show();
}

function SetStudent() {
  $('#session-id').text(
    connection.extra.userFullName + '(' + params.sessionid + ')'
  );
  $('#my-name').text('학생 이름 : ' + connection.extra.userFullName);
  $('.for_teacher').hide();
  $('#main-video').show();
  //$("#top_all_controll").hide();
}

SelectViewType();

function SetStudentList(){
    $("#student_list").empty();

    console.log(connection.getAllParticipants());

    if(connection.getAllParticipants().length == 0){
        $("#student_list").append('<span class="no_student"> 접속한 학생이 없습니다 </span>')
    }
    else {
        connection.getAllParticipants().forEach(function(pid) {
            var name = getFullName(pid)
           var div = $(' <span data-id="' + pid + '" data-name="' + name + '" class="student">\
                <span class="bor"></span> \
                <span class="name"><span class="alert alert_wait"></span>' + name + '</span></span>')
            OnClickStudent(div,pid,name);
            $("#student_list").append(div);
        });
    }
}

function SelectViewType(){
    $(".view_type").click(function(){
        $(".view_type").removeClass("view_type-on");
        $(this).addClass("view_type-on");

        switch(this.id){
            case "top_student" :
                $("#main-video").hide();
                $("#student_list").show();
                break;
            case "top_camera" :
                $("#main-video").show();
                $("#student_list").hide();
                break;
        }
    })
}

$('#top_test').click(function () {
  if ($('#exam-board').is(':visible')) {
    $('#exam-board').hide(300);
  } else {
    // 선생님
    if (params.open === 'true') {
      $('#exam-omr').hide();
      $('#exam-setting-bar').show();
    }
    // 학생
    else {
      $('#exam-omr').show();
      $('#exam-setting-bar').hide();
    }
    $('#exam-board').show(300);
  }
});

var m_QuesCount = 0; // 현재 문제수
var m_ExamTimerInterval; // 시험 타이머 인터벌
var m_ExamTime; //

// 문제수 적용 (문제 n개 만들기)
$('#exam-setting-apply').click(function () {
  m_QuesCount = $('#exam-question-count').val();
  var answerList = getQuestionAnswerList();
  $('#exam-qustion-list').html('');
  for (var i = 1; i <= m_QuesCount; i++) {
    apeendQuestion(i);
  }

  setQuestionAnswer(answerList);
});

// 문제 1개 추가
$('#exam-add-question').click(function () {
  apeendQuestion(++m_QuesCount);
  $('#exam-question-count').val(m_QuesCount);
});

// 시험 시작, 종료
$('#exam-start').toggle(
  function () {
    if (!examObj.checkAnswerChecked()) {
      //  TODO : 모든 문제에 대한 답 작성 하라는 알림
      console.log('빠진 답');
      return;
    }

    if (isNaN($('#exam-time').val())) {
      // TODO : 시간 설정하라고 알림
      $('#exam-start').click();
      return;
    } else {
      m_ExamTime = parseInt($('#exam-time').val() * 60);
    }

    var answerList = getQuestionAnswerList();

    $('#exam-start').attr('class', 'btn btn-danger');
    $('#exam-start').html('시험 종료');

    examObj.examAnswer = answerList;
    examObj.sendExamStart(parseInt(m_ExamTime / 60));

    m_ExamTimerInterval = setInterval(function () {
      m_ExamTime--;
      $('#exam-time').val(parseInt(m_ExamTime / 60) + ':' + (m_ExamTime % 60));
      if (m_ExamTime <= 0) $('#exam-start').click();
    }, 1000);

    showExamStateForm();
  },
  function () {
    $('#exam-start').attr('class', 'btn btn-exam');
    $('#exam-start').html('시험 시작');
    clearInterval(m_ExamTimerInterval);
    $('#exam-time').val(parseInt(m_ExamTime / 60));

    examObj.sendExamEnd();
  }
);

// 시험 문제 정답률 폼 표시
function showExamStateForm() {
  $('#exam-state').show();
  var stateHtmlStr = '';
  for (var i = 1; i <= m_QuesCount; i++) {
    stateHtmlStr += `<span style='font-weight:bold'>${i}.</span><progress id="exam-state-progress-${i}" value="0" max="100"></progress><span id="exam-state-percent-${i}" >0%</span><br>`;
  }
  $('#exam-state').html(stateHtmlStr);
}

// 시험 문제 하나의 정답률 변경 / 형식 -> (문제번호, 문제정답수/학생수)
function setExamState(num, percent) {
  $(`#exam-state-progress-${num}`).val(percent);
  $(`#exam-state-percent-${num}`).html(percent + '%');
}

// 문제 html에 하나 추가 (apeend)
function apeendQuestion(i) {
  question = `<div id='exam-question-${i}' style='display: flex;'>`;

  question += `<span id='exam-question-text-${i}' style='flex:2; text-align:center; font-weight:bold; margin-top:2px;'>${i}.</span>`;

  for (var j = 1; j <= 5; j++) {
    question += `<input type='radio' id='exam-question-${i}_${j}' name='exam-question-${i}' value='${j}'> `;
    question += `<label for='exam-question-${i}_${j}' style='flex:1;'>${j}</label>`;
  }

  question += `<button id='exam-question-delete-${i}' onclick='deleteQuestion(${i})' class='btn btn-exam' style='flex:1; padding: 0px 3px 0px 3px; margin:5px; font-weight:bold;'>─</button>`;

  question += `</div>`;
  $('#exam-qustion-list').append(question);

  $(`#exam-question-${i}`).change(function () {
    $(`#exam-question-${i}`).css('background', '#eff1f0');
  });
}

// 문제 하나 제거
function deleteQuestion(num) {
  var answerList = getQuestionAnswerList();
  m_QuesCount--;
  answerList.splice(num - 1, 1);
  $('#exam-qustion-list').html('');
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
    $(
      `input:radio[name='exam-question-${i}'][value=${answerList[i - 1]}]`
    ).prop('checked', true);
    if ($(`input:radio[name='exam-question-${i}']`).is(':checked')) {
      $(`#exam-question-${i}`).css('background', '#eff1f0');
    }
  }
}

// 학생들 OMR 세팅
function setStudentOMR(quesCount, examTime) {
  $('#exam-omr').show();
  $('#exam-board').show();

  $('#exam-omr').html('');
  question = "<div id='exam-student-timer'>0:0</div>";

  m_QuesCount = quesCount;
  for (var i = 1; i <= m_QuesCount; i++) {
    question += `<div id='exam-question-${i}' onchange='omrChange(${i})'>`;

    question += `<span id='exam-question-text-${i}'>${i}: </span>`;

    for (var j = 1; j <= 5; j++) {
      question += `<input type='radio' id='exam-question-${i}_${j}' name='exam-question-${i}' value='${j}'> `;
      question += `<label for='exam-question-${i}_${j}'>${j}</label>`;
    }

    question += `</div>`;
  }
  question +=
    "<button onclick='submitOMR()' class='btn btn-primary'>시험제출</button>";
  $('#exam-omr').html(question);

  m_ExamTime = parseInt(examTime * 60);

  m_ExamTimerInterval = setInterval(function () {
    m_ExamTime--;
    $('#exam-student-timer').html(
      parseInt(m_ExamTime / 60) + ':' + (m_ExamTime % 60)
    );
    if (m_ExamTime <= 0) clearInterval(m_ExamTimerInterval);
  }, 1000);
}

// 학생 시험 OMR 제출
function submitOMR() {
    if (!examObj.checkStudentAnswerChecked(m_QuesCount)) {
        // TODO : 경고 표시, 답안지 작성이 완료가 안되었다는 내용.
        return;
    }

  clearInterval(m_ExamTimerInterval);
  var studentOMR = getQuestionAnswerList();
  examObj.examAnswer = studentOMR;
  //  console.log(studentOMR);

  examObj.sendSubmit();

  $('#exam-omr').html('');
  $('#exam-board').hide();
}

// 학생 OMR이 변경됨
function omrChange(num) {
  $(`#exam-question-${num}`).css('background', '#eff1f0');

  // console.log(num + "번이 변경됨");
  var questionNumber = num;
  var answerNumber = $(
    `input:radio[name='exam-question-${num}']:checked`
  ).val();

  // 선생한테 전송.
  examObj.sendSelectExamAnswerToTeacher(questionNumber, answerNumber);
}
$('#icon_exit').click(function () {
  history.back();
});

$(window).on('beforeunload', function () {
  // return 1;
});

// 모달로 만들어서 pdf 선택 해야함
// 로드시 글자깨짐 현상 해결 해야함
// 소켓통신으로 제어 필요

let isFileViewer = false;
$('#top_pdf').click(function () {
  console.log(isFileViewer);
  if (isFileViewer === false) {
    loadFileViewer();
    $('#canvas-controller').show();
    isFileViewer = true;
  } else {
    unloadFileViewer();
    $('#canvas-controller').hide();
    isFileViewer = false;
  }
});

function unloadFileViewer() {
    let frame = document
    .getElementById('widget-container')
    .getElementsByTagName('iframe')[0].contentWindow;
    frame.document.getElementById("main-canvas").style.zIndex = "0";
    frame.document.getElementById("temp-canvas").style.zIndex = "1";
    frame.document.getElementById("tool-box").style.zIndex = "2";

    let fileViewer = frame.document.getElementById('file-viewer');
    fileViewer.remove();
}

function loadFileViewer() {
  console.log('loadFileViewer');
  let fileViewer = document.createElement('iframe');
  fileViewer.setAttribute('id', 'file-viewer');
  fileViewer.setAttribute(
    'src',
    'https://localhost:9001/ViewerJS/#https://localhost:9001/files/pdf-test.pdf'
  );
  fileViewer.style.width = '1024px';
  fileViewer.style.height = '724px';
  fileViewer.style.cssText =
    'border: 1px solid black;height:1024px;direction: ltr;margin-left:0%;width:60%;';
  fileViewer.setAttribute('allowFullScreen', '');
  let frame = document
    .getElementById('widget-container')
    .getElementsByTagName('iframe')[0].contentWindow;


    frame.document
    .getElementsByClassName('design-surface')[0]
    .appendChild(fileViewer);
    frame.document.getElementById("main-canvas").style.zIndex = "1";
    frame.document.getElementById("temp-canvas").style.zIndex = "1";
    frame.document.getElementById("tool-box").style.zIndex = "2";
}

_3DCanvasFunc();
_AllCantrallFunc();

// 알림 박스 생성
function alertBox(message, title, callback_yes, callback_no) {
  callback_yes = callback_yes || function () {};
  callback_no = callback_no || function () {};

  var clickCount = 0;

  $('.btn-alert-yes')
    .unbind('click')
    .bind('click', function (e) {
      if (clickCount++ == 0) {
        e.preventDefault();
        $('#alert-box').fadeOut(300);
        callback_yes();
      }
    });
  $('.btn-alert-no')
    .unbind('click')
    .bind('click', function (e) {
      if (clickCount++ == 0) {
        e.preventDefault();
        $('#alert-box').fadeOut(300);
        callback_no();
      }
    });

  $('#alert-title').html(title || '알림');
  $('#alert-message').html(message);
  $('#alert-box').fadeIn(300);
}

$('#top_alert').click(function () {
    classroomCommand.sendAlert (function(){
        var chilldren = document.getElementById("student_list").children;
            
        for(var i = 0; i < chilldren.length; i++){
            var al = chilldren[i].getElementsByClassName("alert")[0];
            al.classList.add("alert_wait");
        }
    });
});


var nowPermission = undefined;
var nowSelectStudent = undefined;


$(".student").click(function(e){
    var menu = document.getElementById("student-menu");
    nowSelectStudent = e.target;
    
    var name = e.target.dataset.name;
    var pid = e.target.dataset.id;

    $("#perbtn").clearQueue();
    $("#perbtn > .circle").clearQueue();

    console.log(e.target.dataset.permission);

    if(e.target.dataset.permission == "true"){
        $("#perbtn").css({
            'background-color' : "#18dbbe"
        })
        $("#perbtn > .circle").css({
            left: "20px"
        })
        $("#perbtn").addClass("on");
        $("#perbtn").removeClass("off");
        
    }
    else{
        $("#perbtn").css({
            'background-color' : "gray"
        })
        $("#perbtn > .circle").css({
            left: "2px"
        })
        $("#perbtn").addClass("off");
        $("#perbtn").removeClass("on");
    }

    $(menu).css({
        left: e.clientX,
        top : e.clientY
    })

    if(!$("#student-menu").is(':visible')){
        $( "#student-menu" ).show( "blind", {}, 150, function(){});
    }

    menu.getElementsByClassName("stuname")[0].innerHTML = name;
})

$(window).click(function(e){
    if(document.getElementById("student-menu") .contains(e.target))
        return false;
    
    if($(e.target).hasClass('student'))
        return false;

    if( $("#student-menu").show() )
        $("#student-menu").hide();
})


function OnClickStudent(div){
    
    div.click(function(e){
        var menu = document.getElementById("student-menu");
        nowSelectStudent = e.target;
        
        var name = e.target.dataset.name;
        var pid = e.target.dataset.id;
    
        $("#perbtn").clearQueue();
        $("#perbtn > .circle").clearQueue();
    
        console.log(e.target.dataset.permission);
    
        if(e.target.dataset.permission == "true"){
            $("#perbtn").css({
                'background-color' : "#18dbbe"
            })
            $("#perbtn > .circle").css({
                left: "20px"
            })
            $("#perbtn").addClass("on");
            $("#perbtn").removeClass("off");
            
        }
        else{
            $("#perbtn").css({
                'background-color' : "gray"
            })
            $("#perbtn > .circle").css({
                left: "2px"
            })
            $("#perbtn").addClass("off");
            $("#perbtn").removeClass("on");
        }
    
        $(menu).css({
            left: e.clientX,
            top : e.clientY
        })
    
        if(!$("#student-menu").is(':visible')){
            $( "#student-menu" ).show( "blind", {}, 150, function(){});
        }
    
        menu.getElementsByClassName("stuname")[0].innerHTML = name;
    })
}

$("#perbtn").click(function(){
    var circle = this.getElementsByClassName("circle")[0];
    var name = nowSelectStudent.dataset.name;
    var pid = nowSelectStudent.dataset.id;

    console.log(nowPermission);

    if(this.classList.contains("off")){
        console.log(nowPermission != undefined);
        
        if(nowPermission != undefined){
            alert("이미 다른 학생에게 권한이 있습니다.");
            return false;
        }
        
        nowPermission = pid;
        nowSelectStudent.dataset.permission = true

        $(this).animate({
            'background-color' : "#18dbbe"
        }, 'fast')
        $(circle).animate({
            left: "20px"
        }, 'fast')    

        $(nowSelectStudent).find(".bor").show();
    }
    else {
        nowPermission = undefined;
        nowSelectStudent.dataset.permission = false;

        $(this).animate({
            'background-color' : "gray"
        }, 'fast')
        $(circle).animate({
            left: "2px"
        },'fast')     
        $(nowSelectStudent).find(".bor").hide();


    }
    this.classList.toggle("on");
    this.classList.toggle("off");
})