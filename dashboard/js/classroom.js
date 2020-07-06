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
let uploadServerUrl = "https://files.primom.co.kr:1443";

var connection = new RTCMultiConnection();
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

SetCanvasBtn('screen_share', ScreenShare);
SetCanvasBtn('3d_view', _3DCanvasOnOff);
SetCanvasBtn('movie', Movie_Render_Button);
SetCanvasBtn('file', LoadFile);
SetCanvasBtn('epub', LoadEpub);

var isSharingScreen = false;
var isSharing3D = false;
var isSharingMovie = false;
var isSharingFile = false;
var isSharingEpub = false;

function checkSharing() {
  return isSharingScreen || isSharing3D || isSharingMovie || isSharingFile ||isSharingEpub;
}

function removeOnSelect(btn) {
  alert('동시에 여러 기능을 공유할 수 없습니다');
  $(btn).removeClass('on');
  $(btn).removeClass('selected-shape');
}

function _3DCanvasOnOff(btn) {
  if (!isSharing3D && checkSharing()) {
    removeOnSelect(btn);
    return;
  }

  var visible = $(btn).hasClass('on');
  console.log(visible);

  if (params.open == 'true') {
    const isViewer = classroomInfo.share3D.state;
    if (false == isViewer) {
      isSharing3D = true;
      //modelEnable(send=true);
      setShared3DStateServer (true);
    }
    else
    {
      isSharing3D = false;
      setShared3DStateServer (false);
      // remove3DCanvas();                
      // connection.send({
      //     modelDisable : true
      // });
    }          
  }
}

// here goes RTCMultiConnection

connection.chunkSize = 16000;
connection.enableFileSharing = true;

connection.session = {
  audio: false,
  video: true,
  data: true,
  screen: false,
};
connection.sdpConstraints.mandatory = {
  OfferToReceiveAudio: false,
  OfferToReceiveVideo: false,
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

};

connection.onopen = function (event) {
  console.log('onopen!');

  SetStudentList();

  connection.onUserStatusChanged(event);
  if (designer.pointsLength <= 0) {
    setTimeout(function () {
      connection.send('plz-sync-points');
    }, 1000);
  }

  // 접속시 방정보 동기화.
  if (connection.extra.roomOwner) {
    mute();
  }

  //  session 연결 완료
  classroomCommand.onConnectionSession (event);
};

connection.onclose = connection.onerror = connection.onleave = function (
  event
) {
  console.log('on close!');
  connection.onUserStatusChanged(event);
};

connection.onmessage = function (event) {

  if(event.data.unmute){
    unmute(event.data.unmute);
  }

  if(event.data.mute){
    mute();
  }

  if(event.data.permissionChanged){
    console.log("permission changed");
    classroomInfo = event.data.permissionChanged;
  }


  if (event.data.showMainVideo) {
    classroomCommand.setShareScreenLocal (true);
          // $('#main-video').show();
    $('#screen-viewer').css({
      top: $('#widget-container').offset().top,
      left: $('#widget-container').offset().left,
      width: $('#widget-container').width(),
      height: $('#widget-container').height(),
    });
    $('#screen-viewer').show();
    return;
  }

  if (event.data.hideMainVideo) {
    // $('#main-video').hide();
    $('#screen-viewer').hide();
    classroomCommand.setShareScreenLocal (false);
    return;
  }

  if (event.data.roomSync) {
    classroomCommand.receiveSyncRoomInfo(event.data.roomSync);
    mute()
    console.log(classroomInfo)
    return;
  }

  if (event.data.chatMessage) {
    appendChatMessage(event);
    return;
  }

  if (event.data === 'plz-sync-points' && connection.extra.roomOwner) {
    designer.sync();
    return;
  }

  if (event.data.studentCmd)  {
    if(connection.extra.roomOwner)
      classroomCommand.onStudentCommand (event.data.studentCmd);
    return;
  }


  if(event.data.roomInfo) {
    classroomCommand.onReceiveRoomInfo (event.data);
    return;
  }

  if (event.data.allControl) { 
      onAllControlValue (event.data.allControl);
    return;
  }

  if (event.data.alert) {
    classroomCommand.receivAlert();
    return;
  }

  if (event.data.alertResponse) {
    classroomCommand.receiveAlertResponse(event.data.alertResponse);
    return;
  }

  if (event.data.exam) {
    // 시험치기..
    examObj.receiveExamData(event.data.exam);
    return;
  }

  if(event.data.pdf) {    
    classroomCommand.updatePDFCmd (event.data.pdf);
    return;
  }

  if (event.data.epub) {
    classroomCommand.receiveEpubMessage(event.data.epub);
    return;
  }

  //3d 모델링 Enable
  if (event.data.modelEnable) {
    var enable = event.data.modelEnable.enable;
    setShared3DStateLocal (enable);
    //modelEnable(false);
    return;
  }

  if (event.data.modelDisable) {
    remove3DCanvas();
    return;
  }

  //3d 모델링 상대값
  if (event.data.ModelState) {
    //console.log(event.data.ModelState);
    set3DModelStateData(
      event.data.ModelState.position,
      event.data.ModelState.rotation
    );
    return;
  }

  //동영상 공유
  if (event.data.MoiveURL) {
    console.log(event.data.MoiveURL);

    var moveURL = event.data.MoiveURL;
    if (moveURL.type == 'YOUTUBE')
      embedYoutubeContent(moveURL.enable, moveURL.url, false);
    else if (moveURL.type == 'VIDEO')
      VideoEdunetContent(moveURL.enable, moveURL.url, false);
    else iframeEdunetContent(moveURL.enable, moveURL.url, false);
    return;
  }
  if(!connection.extra.roomOwner){
    designer.syncData(event.data);
  }
};

// extra code
connection.onstream = function (event) {
  console.log('onstream!');

  if(params.open === 'true' || params.open === true){
    mute();
  }

  if (event.stream.isScreen && !event.stream.canvasStream) {
    $('#screen-viewer').get(0).srcObject = event.stream;
    if (!classroomInfo.shareScreen) 
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
    if (event.extra.roomOwner) {
      var notice = document.getElementById('noticewindow');
      $(notice).append(
        "<div> <font color='#C63EE8'> 선생님 </font> : " +
          ConvertChatMsg(event.data.chatMessage) +
          '</div>'
      );
      notice.scrollTop = notice.clientHeight;
      notice.scrollTop = notice.scrollHeight - notice.scrollTop;
    }
  } catch {}

  if (event.data) {
    var id = event.extra.userFullName || event.userid;
    if (event.extra.roomOwner == true) {
      id += '(선생님)';
    }

    div.innerHTML =
      '<b>' + id + ' : </b>' + ConvertChatMsg(event.data.chatMessage);
    if (event.data.checkmark_id) {
      connection.send({
        checkmark: 'received',
        checkmark_id: event.data.checkmark_id,
      });
    }
  } else {
    div.innerHTML =
      '<b> <font color="#3E93E8"> 나 </font>: </b>' + ConvertChatMsg(event);

    if (params.open === 'true' || params.open === true) {
      var notice = document.getElementById('noticewindow');
      $(notice).append(
        "<div> <font color='#C63EE8'> 선생님 </font> : " +
          ConvertChatMsg(event) +
          '</div>'
      );
      notice.scrollTop = notice.clientHeight;
      notice.scrollTop = notice.scrollHeight - notice.scrollTop;
    }

    // div.style.background = '#cbffcb';
  }

  conversationPanel.appendChild(div);

  conversationPanel.scrollTop = conversationPanel.clientHeight;
  conversationPanel.scrollTop =
    conversationPanel.scrollHeight - conversationPanel.scrollTop;
}

function ConvertChatMsg(_msg) {
  var div = document.createElement('span');
  div.innerHTML = _msg;

  var msg = $(div);
  var a = msg.find('a');

  if (a.length != 0) {
    console.log(div);
    a.attr('target', '_blank');
    return div.innerHTML;
  } else {
    return _msg;
  }
}


$('#txt-chat-message').emojioneArea({
  pickerPosition: 'top',
  filtersPosition: 'bottom',
  tones: false,
  autocomplete: true,
  inline: true,
  hidePickerOnBlur: true,
  placeholder: '메세지를 입력하세요',

  events: {
    focus: function () {
      $('.emojionearea-category')
        .unbind('click')
        .bind('click', function () {
          $('.emojionearea-button-close').click();
        });
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


      classroomCommand.joinRoom ();

      connection.socket.on('disconnect', function () {
        location.reload();
      });
    });
  } else {
    console.log('try joining!');
    connection.DetectRTC.load(function () {
      SetStudent();

      console.log(connection.DetectRTC);
      console.log(connection);
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

        classroomCommand.joinRoom ();

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
    replaceTrackToPeer(pid, videoTrack, screenTrackId);
  });
}
/*
    Peer당 replaceTrack
*/
function replaceTrackToPeer(pid, videoTrack, screenTrackId) {
  if (!connection.peers[pid]) {
    console.error('connection peer error');
    return;
  }
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
}

/*
   특정 유저에게 스크린공유를 걸어준다.
*/
function currentScreenViewShare(_pid) {
  let stream = window.shareStream;
  if (!stream) {
    console.error('stream not found');
    return;
  }

  //  선생님만 할 수 있게..
  if (!connection.extra.roomOwner) return;

  // var remoteUserId = _pid;
  // var videoTrack = stream.getVideoTracks()[0];
  // connection.replaceTrack(videoTrack, remoteUserId);
  const pid = _pid;
  stream.getTracks().forEach(function (track) {
    if (track.kind === 'video' && track.readyState === 'live') {
      replaceTrackToPeer(pid, track);
    }
  });

  connection.send({
    showMainVideo: true,
  });
}

function replaceScreenTrack(stream, btn) {
  
  classroomCommand.setShareScreenServer (true, result => {

  stream.isScreen = true;
  stream.streamid = stream.id;
  stream.type = 'local';

  connection.onstream({
    stream: stream,
    type: 'local',
    streamid: stream.id,
  });

  // 현재 stream을 저장해서, 나중에 들어오는 사람한테도 전송한다.
  window.shareStream = stream;  
  var screenTrackId = stream.getTracks()[0].id;

  addStreamStopListener(stream, function () {    

    classroomCommand.setShareScreenServer(false, () => {
      connection.send({
        hideMainVideo: true,
      });
      $(btn).removeClass("on");
      $(btn).removeClass("selected-shape");
      isSharingScreen = false;
      // $('#main-video').hide();
      classroomInfo.shareScreen = false;
      window.sharedStream = null;
      hideScreenViewerUI();
      replaceTrack(tempStream.getTracks()[0], screenTrackId);
    });
  
  });

  stream.getTracks().forEach(function (track) {
    if (track.kind === 'video' && track.readyState === 'live') {
      replaceTrack(track);
    }
  });

  connection.send({
    showMainVideo: true,
  });

  showScreenViewerUI ();

  });

  // $('#main-video').show();
}

function showScreenViewerUI() {
  $('#screen-viewer').css({
    top: $('#widget-container').offset().top,
    left: $('#widget-container').offset().left,
    width: $('#widget-container').width(),
    height: $('#widget-container').height(),
  });
  $('#screen-viewer').show();
}

function hideScreenViewerUI() {
  $('#screen-viewer').hide();
  $('#top_share_screen').show();
}

let classTimeIntervalHandle;

function updateClassTime() {
  var now = new Date().getTime() - classroomInfo.roomOpenTime;
  now = parseInt(now / 1000);

  if (!classTimeIntervalHandle)
    classTimeIntervalHandle = setInterval(Sec, 1000);

  function Sec() {
    now++;
    var time = now;
    var hour = Math.floor(time / 3600);
    time %= 3600;

    var min = Math.floor(time / 60);
    time %= 60;

    if (min < 10) min = '0' + min;

    if (time < 10) time = '0' + time;

    $('#current-time').text(hour + ':' + min + ':' + time);
  }
}


function SetTeacher(){
    $('#session-id').text(connection.extra.userFullName+" ("+params.sessionid+")");
    $("#my-name").remove();
    $(".for_teacher").show();
    $(".controll").show();
    $(".feature").show();
}

function SetStudent() {
  $('#session-id').text(
    connection.extra.userFullName + '(' + params.sessionid + ')'
  );
  $('#my-name').text('학생 이름 : ' + connection.extra.userFullName);
  $('.for_teacher').hide();
  $('#main-video').show();
  $(".for_teacher").show();
  $(".controll").remove();
  $(".feature").remove();

  let frame = document
  .getElementById('widget-container')
  .getElementsByTagName('iframe')[0].contentWindow;

  $(frame.document.getElementById("3d_view")).remove();
  $(frame.document.getElementById("movie")).remove();
  $(frame.document.getElementById("file")).remove();
  $(frame.document.getElementById("epub")).remove();
  
  //$("#top_all_controll").hide();
}

SelectViewType();

function SetStudentList() {
  if(!connection.extra.roomOwner)
    return;

  $('#student_list').empty();

  if(connection.getAllParticipants().length == 0){
    // $("#student_list").append('<span class="no_student"> 접속한 학생이 없습니다 </span>')?
  }
  else {
    var isOutCPms = true;
    var isOutMPms = true;

    connection.getAllParticipants().forEach(function(pid) {
      var name = getFullName(pid)
      var div = $(' <span data-id="' + pid + '" data-name="' + name + '" class="student">\
        <span class="bor"></span> \
        <span class="name"><span class="alert alert_wait"></span>' + name + '</span></span>')
      OnClickStudent(div,pid,name);
      $("#student_list").append(div);

      /* 사라진 권한을 다시 준다  */
      if(pid === classroomInfo.nowClassPermission){
        isOutCPms = false;
        $(`[data-id='${pid}']`).attr('data-class-Permission', true);
        $(`[data-id='${pid}']`).find(".bor").show();
      }
      if(pid === classroomInfo.nowMicPermission){
        isOutMPms = false;
        $(`[data-id='${pid}']`).attr('data-mic-Permission', true);
      }
    });

    if(isOutCPms)
      classroomInfo.nowClassPermission = undefined;
    if(isOutMPms)
      classroomInfo.nowMicPermission = undefined;
  }
}

function SelectViewType() {
  $('.view_type').click(function () {
    $('.view_type').removeClass('view_type-on');
    $(this).addClass('view_type-on');

    switch (this.id) {
      case 'top_student':
        $('#main-video').hide();
        $('#student_list').show();
        break;
      case 'top_camera':
        $('#main-video').show();
        $('#student_list').hide();
        break;
    }
  });
}

$('#top_test').click(function () {
  if ($('#exam-board').is(':visible')) {
    $('#exam-board').hide(300);
  } else {
    // 선생님
    if (params.open === 'true') {
      $('#exam-omr').hide();
      $('#exam-teacher-menu').show();
    }
    // 학생
    else {
      $('#exam-omr').show();
      $('#exam-teacher-menu').hide();
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

// 시험 시작, 종료 버튼 이벤트
$('#exam-start').click(function () {
  if (m_QuesCount <= 0) {
    alert('답안지를 먼저 작성해야 합니다');
    return;
  }
  //const questionCount = $('#exam-question-count').val();
  if (!examObj.checkAnswerChecked(m_QuesCount)) {
    alert('문제애 대한 모든 답을 선택해야 합니다');
    return;
  }

  const examTime = $('#exam-time').val();
  if (examTime <= 0 || isNaN(examTime)) {
    alert('시간 설정이 잘못 되었습니다.');
    return;
  }

  m_ExamTime = parseInt($('#exam-time').val() * 60);

  var answerList = getQuestionAnswerList();

  examObj.examAnswer = answerList;
  examObj.sendExamStart(m_QuesCount, parseInt(m_ExamTime / 60));

  $('#exam-setting-bar').hide();
  showExamStateForm();

  $('#exam-teacher-timer').html(
    parseInt(m_ExamTime / 60) + ':' + (m_ExamTime % 60)
  );
  m_ExamTimerInterval = setInterval(function () {
    m_ExamTime--;
    examObj.updateExameTimer(m_ExamTime);
    $('#exam-teacher-timer').html(
      parseInt(m_ExamTime / 60) + ':' + (m_ExamTime % 60)
    );
    if (m_ExamTime <= 0) $('#exam-start').click();
  }, 1000);
});

function finishExam() {
  clearInterval(m_ExamTimerInterval);
  $('#exam-time').val(parseInt(m_ExamTime / 60));
  $('#exam-setting-bar').show();
  $('#exam-state').html('');
  examObj.sendExamEnd();
}

// 시험 문제 정답률 폼 표시
function showExamStateForm() {
  $('#exam-state').show();
  var stateHtmlStr = '';

  stateHtmlStr += "<div class='exam-header'>";
  stateHtmlStr += '<div>시험 중</div>';
  stateHtmlStr += "<div id='exam-teacher-timer' style='color:red;'>0:0</div>";
  stateHtmlStr += '</div>';
  stateHtmlStr += "<div class='exam-background exam-overflow'>";
  for (var i = 1; i <= m_QuesCount; i++) {
    stateHtmlStr += `<div style='display:flex; height:3vh;'>`;
    stateHtmlStr += `<span class='text-center-bold' style='flex:1;'>${i}.</span>`;
    stateHtmlStr += `<progress style='flex:4; margin-top:10px' id="exam-state-progress-${i}" class='exam-state-progress'  value="0" max="100"></progress>`;
    stateHtmlStr += `<span style='flex:1; text-align:center;'  id='exam-state-percent-${i}'>0%</span><br>`;
    stateHtmlStr += `</div>`;
  }
  stateHtmlStr += '</div>';
  stateHtmlStr +=
    "<button id='exam-finish' class='btn btn-danger exam-80-button' onclick='finishExam()'>시험 종료</button>";

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

  question += `<span id='exam-question-text-${i}' class='text-center-bold' style='flex:2; margin-top:2px;'>${i}.</span>`;

  for (var j = 1; j <= 5; j++) {
    question += `<input type='radio' id='exam-question-${i}_${j}' name='exam-question-${i}' value='${j}'> `;
    question += `<label for='exam-question-${i}_${j}' style='flex:1;'>${j}</label>`;
  }

  question += `<button id='exam-question-delete-${i}' onclick='deleteQuestion(${i})' class='btn btn-exam  text-center-bold' style='flex:1; padding: 0px 3px 0px 3px; margin:5px;'>─</button>`;

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
  var question = '';

  question += "<div class='exam-header'>";
  question += '<div>시험 중</div>';
  question += "<div id='exam-student-timer' style='color:red;'>0:0</div>";
  question += '</div>';
  question += "<div id='exam-question-list' class='exam-border-bottom'>";
  m_QuesCount = quesCount;
  for (var i = 1; i <= m_QuesCount; i++) {
    question += `<div id='exam-question-${i}' style='display:flex;' onchange='omrChange(${i})'>`;
    question += `<span id='exam-question-text-${i}' class='text-center-bold' style='flex:1;'>${i}.</span>`;
    for (var j = 1; j <= 5; j++) {
      question += `<input type='radio' id='exam-question-${i}_${j}' style='flex:5;' name='exam-question-${i}' value='${j}'> `;
      question += `<label for='exam-question-${i}_${j}'>${j}</label>`;
    }
    question += `<span id='exam-student-answer-${i}' class='text-center-bold' style='flex:1;'></span>`;
    question += `</div>`;
  }
  question += `</div>`;
  question +=
    "<button onclick='submitOMR()' id='exam-answer-submit' class='btn btn-exam exam-80-button' onclick='finishExam()'>제출하기</button>";
  $('#exam-omr').html(question);

  m_ExamTime = parseInt(examTime * 60);
  $('#exam-student-timer').html(
    parseInt(m_ExamTime / 60) + ':' + (m_ExamTime % 60)
  );

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
    alert('아직 답안지 작성이 완료 안되었습니다');
    return;
  }

  stopQuestionOMR();
  examObj.sendSubmit();
  // $('#exam-omr').html("");
  // $('#exam-board').hide();
}

function stopQuestionOMR() {
  clearInterval(m_ExamTimerInterval);
  var studentOMR = getQuestionAnswerList();
  examObj.examAnswer = studentOMR;
  //  console.log(studentOMR);

  $('#exam-question-list').css('pointer-events', 'none');
  $('#exam-answer-submit').hide();
}

// 학생 정답 표시
function markStudent(num, check, answer) {
  console.log(check);
  if (check === answer) {
    $(`#exam-question-${num}`).css('background-color', 'lightgreen');
  } else {
    $(`#exam-question-${num}`).css('background-color', 'pink');
  }
  $(`#exam-student-answer-${num}`).html(answer);
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

function LoadFile(btn) {
  if (!isSharingFile && checkSharing()) {
    removeOnSelect(btn);
    return;
  }
  
  if(!connection.extra.roomOwner) return;
  
  fileUploadModal("파일 관리자",function(e){console.log(e)});

  // classroomCommand.togglePdfStateServer ((state) => {
  //   // if(state) 
  //   // {
  //   //   isSharingFile = true;
  //   //   isFileViewer = true;
  //   // }
  //   // else
  //   // {
  //   //   isSharingFile = false;
  //   //   isFileViewer = false;
  //   // }
  // }) 
  
  // if (isFileViewer === false) {
  //   isSharingFile = true;
  //   loadFileViewer();
  //   $('#canvas-controller').show();
  //   isFileViewer = true;
  //   classroomCommand.sendOpenPdf ();
  // } else {
  //   isSharingFile = false;
  //   unloadFileViewer();
  //   $('#canvas-controller').hide();
  //   isFileViewer = false;
  //   classroomCommand.sendClosePdf ();
  // }
}

function unloadFileViewer() {
  isSharingFile = false;
  isFileViewer = false;

  let frame = document
    .getElementById('widget-container')
    .getElementsByTagName('iframe')[0].contentWindow;
  frame.document.getElementById('main-canvas').style.zIndex = '1';
  frame.document.getElementById('temp-canvas').style.zIndex = '2';
  frame.document.getElementById('tool-box').style.zIndex = '3';

  let fileViewer = frame.document.getElementById('file-viewer');
  fileViewer.remove();
}

function loadFileViewer(url) {
  $('#confirm-box').modal('hide');
  $('#confirm-box-topper').hide();

  classroomCommand.togglePdfStateServer ((state) => {});
  console.log('loadFileViewer');
  isSharingFile = true;
  isFileViewer = true;

  let fileViewer = document.createElement('iframe');
  fileViewer.setAttribute('id', 'file-viewer');
  fileViewer.setAttribute(
    'src',
    'https://'+window.location.host+'/ViewerJS/#'+url
  );
  fileViewer.style.width = '1024px';
  fileViewer.style.height = '724px';
  fileViewer.style.cssText =
    'border: 1px solid black;height:1024px;direction: ltr;margin-left:2%;width:78%;';
  fileViewer.setAttribute('allowFullScreen', '');
  let frame = document
    .getElementById('widget-container')
    .getElementsByTagName('iframe')[0].contentWindow;

  frame.document
    .getElementsByClassName('design-surface')[0]
    .appendChild(fileViewer);
  frame.document.getElementById('main-canvas').style.zIndex = '1';
  frame.document.getElementById('temp-canvas').style.zIndex = '2';
  frame.document.getElementById('tool-box').style.zIndex = '3';
}


// Pdf가 처음 로딩이 다 되었는지 확인.
// 로딩이 다 된 후에 페이지 동기화
function pdfOnLoaded () {
  classroomCommand.pdfOnLoaded ();
}

function showPage(n){  ;
  if(connection.extra.roomOwner || !classroomInfo.allControl) 
    classroomCommand.setPdfPage(n);

}

function showNextPage(){  
  // if(connection.extra.roomOwner || !classroomInfo.allControl) 
  //   classroomCommand.sendPDFCmd('next');
}

function showPreviousPage(){
  // if(connection.extra.roomOwner || !classroomInfo.allControl) 
  //   classroomCommand.sendPDFCmd('prev');
}

// function toggleFullScreen(){
//   if(connection.extra.roomOwner || !classroomInfo.allControl)
//     classroomCommand.sendPDFCmd('fullscreen');
// }

// function togglePresentationMode(){
//   if(connection.extra.roomOwner || !classroomInfo.allControl)
//     classroomCommand.sendPDFCmd('presentation');
// }

function zoomIn() {
    classroomCommand.sendPDFCmdAllControlOnlyTeacher('zoomIn');
}

function zoomOut() {
    classroomCommand.sendPDFCmdAllControlOnlyTeacher('zoomOut');
}

isEpubViewer = false;

function LoadEpub(btn) {
  if (!isSharingEpub && checkSharing()) {
    removeOnSelect(btn);
    return;
  }

  if (!connection.extra.roomOwner) return;

  if (isEpubViewer === false) {
    isSharingEpub = true;
    loadEpubViewer();
    $('#canvas-controller').show();
    isEpubViewer = true;
    classroomCommand.sendOpenEpub();


  } else {
    isSharingEpub = false;
    unloadEpubViewer();
    $('#canvas-controller').hide();
    isEpubViewer = false;
    classroomCommand.sendCloseEpub();
  }
}


var renditionBuffer;

function loadEpubViewer() {
  isSharingEpub = true;
  isEpubViewer = true;
  console.log("Load Epub viewer");
  let epubViewer = document.createElement('div');
  epubViewer.setAttribute('id', 'epub-viewer');
  epubViewer.setAttribute('class', 'spread');
  epubViewer.style.cssText = "width: 78%;height: 1024px;box-shadow: 0 0 4px #ccc;border-radius: 5px;padding: 0;position: relative;margin: 10px 3%;background: white url('/dashboard/img/loading.gif') center center no-repeat;";
  let frame = document
    .getElementById('widget-container')
    .getElementsByTagName('iframe')[0].contentWindow;

  frame.document
    .getElementsByClassName('design-surface')[0]
    .appendChild(epubViewer);
  frame.document.getElementById('main-canvas').style.zIndex = '1';
  frame.document.getElementById('temp-canvas').style.zIndex = '2';
  frame.document.getElementById('tool-box').style.zIndex = '3';

  var book = ePub(
    'https://files.primom.co.kr/epub/fca2229a-860a-6148-96fb-35eef8b43306/Lesson07.epub/ops/content.opf'
  );
  var rendition = book.renderTo(epubViewer, {
    manager: 'continuous',
    flow: 'paginated',
    width: '100%',
    height: 1024,
    snap: true
  });


  renditionBuffer = rendition;
 
var displayed;
if(connection.extra.roomOwner)
  displayed = rendition.display();
else 
{
  if(classroomInfo.epub.page)
      displayed = rendition.display(classroomInfo.epub.page);
    else
      displayed = rendition.display();
}


  displayed.then(function (renderer) {  
    // console.log(renderer);
  });

  // Navigation loaded
  book.loaded.navigation.then(function (toc) {
    // console.log(toc);    
  });

  rendition.on('relocated', function(locations) {    
    // Tofix : 현재 페이지의 정보가 제대로 안 날라온다.
    console.log(locations);
    classroomCommand.sendEpubCmd('page', {
      page : locations.start.index
    });    
  });
  


  var next = document.getElementById('next');  
  next.style.display = 'block';
  next.addEventListener(
    'click',
    function () {
      rendition.next(); 
    },
    false
  );

  var prev = document.getElementById('prev');
  prev.style.display = 'block';
  prev.addEventListener(
    'click',
    function () {   
      rendition.prev();  
    },
    false
  );

  var keyListener = function (e) {
    // Left Key
    if ((e.keyCode || e.which) == 37) {
      rendition.prev();
    }

    // Right Key
    if ((e.keyCode || e.which) == 39) {
      rendition.next();  
    }
  };

  rendition.on('keyup', keyListener);
  document.addEventListener('keyup', keyListener, false);
}

function unloadEpubViewer() {

  isSharingEpub = false;
  isEpubViewer = false;

  renditionBuffer = null;

  var prev = document.getElementById('prev');
  prev.style.display = 'none';
  var prevClone = prev.cloneNode(true);
  prev.parentNode.replaceChild(prevClone, prev);

  var next = document.getElementById('next');
  next.style.display = 'none';

  var nextClone = next.cloneNode(true);
  next.parentNode.replaceChild(nextClone, next);

  let frame = document
    .getElementById('widget-container')
    .getElementsByTagName('iframe')[0].contentWindow;
  frame.document.getElementById('main-canvas').style.zIndex = '1';
  frame.document.getElementById('temp-canvas').style.zIndex = '2';
  frame.document.getElementById('tool-box').style.zIndex = '3';

  let epubViewer = frame.document.getElementById('epub-viewer');
  epubViewer.remove();
}


_3DCanvasFunc();
_AllCantrallFunc();
_Movie_Render_Button_Func();

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
  $('#alert-content').html(message);
  $('#alert-box').fadeIn(300);
}

$('#top_alert').click(function () {
  classroomCommand.sendAlert(function () {
    var chilldren = document.getElementById('student_list').children;

    for (var i = 0; i < chilldren.length; i++) {
      var al = chilldren[i].getElementsByClassName('alert')[0];
      al.classList.add('alert_wait');
    }
  });
});

var nowSelectStudent = undefined;

$(window).click(function (e) {
  if (document.getElementById('student-menu').contains(e.target)) return false;

  if ($(e.target).hasClass('student')) return false;

  if ($('#student-menu').show()) $('#student-menu').hide();
});


$(".perbtn").click(function(){
  var circle = this.getElementsByClassName("circle")[0];
  var name = nowSelectStudent.dataset.name;
  var pid = nowSelectStudent.dataset.id;

  if (this.id == "classP") {
    if (this.classList.contains("off")) {
      if (classroomInfo.nowClassPermission != undefined) {
        alert('이미 다른 학생에게 권한이 있습니다.');
        return false;
      }

      classroomInfo.nowClassPermission = pid;
      nowSelectStudent.dataset.classPermission = true;

      if(classroomInfo.nowMicPermission !== pid){
        if(classroomInfo.nowMicPermission === undefined){
          classroomInfo.nowMicPermission = pid;
        }
        else{
          $(`[data-id='${classroomInfo.nowMicPermission}']`).attr('data-mic-Permission', false);
        }
        $('#micP').animate({
          'background-color': "#18dbbe"
        }, 'fast')
        $('#micP').children('.circle').animate({
          left: "22px"
        }, 'fast')

        $('#micP').toggleClass("on");
        $('#micP').toggleClass("off");

        classroomInfo.nowMicPermission = pid;
        nowSelectStudent.dataset.micPermission = true;
      }

      $(this).animate(
        {
          'background-color': '#18dbbe',
        },
        'fast'
      );
      $(circle).animate(
        {
          left: '22px',
        },
        'fast'
      );

      $(nowSelectStudent).find(".bor").show();
    }
    else {
      if(classroomInfo.nowMicPermission == classroomInfo.nowClassPermission){
        $('#micP').animate({
          'background-color': "gray"
        }, 'fast')
        $('#micP').children('.circle').animate({
          left: "2px"
        }, 'fast')
        classroomInfo.nowMicPermission = undefined;
        nowSelectStudent.dataset.micPermission = false;
        
        $('#micP').toggleClass("on");
        $('#micP').toggleClass("off");
      }
      classroomInfo.nowClassPermission = undefined;
      nowSelectStudent.dataset.classPermission = false;

      $(this).animate(
        {
          'background-color': 'gray',
        },
        'fast'
      );
      $(circle).animate(
        {
          left: '2px',
        },
        'fast'
      );
      $(nowSelectStudent).find('.bor').hide();
    }
  }

  else if (this.id == "micP") {
    if (this.classList.contains("off")) {
      console.log(classroomInfo.nowMicPermission != undefined);

      if (classroomInfo.nowMicPermission != undefined) {
        alert('이미 다른 학생에게 권한이 있습니다.');
        return false;
      }

      classroomInfo.nowMicPermission = pid;
      nowSelectStudent.dataset.micPermission = true;

      $(this).animate(
        {
          'background-color': '#18dbbe',
        },
        'fast'
      );
      $(circle).animate(
        {
          left: '22px',
        },
        'fast'
      );
    }
    else {
      classroomInfo.nowMicPermission = undefined;
      nowSelectStudent.dataset.micPermission = false;
      $(this).animate(
        {
          'background-color': 'gray',
        },
        'fast'
      );
      $(circle).animate(
        {
          left: '2px',
        },
        'fast'
      );
    }
  }

  this.classList.toggle('on');
  this.classList.toggle('off');

  if(this.classList.contains("on")){
    SendUnmute(classroomInfo.nowMicPermission);
  }
  else{
    SendMute();
  }

  connection.send({
    permissionChanged : classroomInfo
  });

});

window.addEventListener('resize', function () {
  rtime = new Date();
  if (timeout === false) {
    timeout = true;
    setTimeout(resizeend, delta);
  }
});

function resizeend() {
  if (new Date() - rtime < delta) {
    setTimeout(resizeend, delta);
  } else {
    timeout = false;
    CanvasResize();
  }
}

function CanvasResize() {
  var frame = document
    .getElementById('widget-container')
    .getElementsByTagName('iframe')[0].contentWindow;
  var canvas = frame.document.getElementById('main-canvas');
  var r = document.getElementsByClassName('lwindow')[0];
  var rwidth = $(r).width();

  var x = canvas.width - rwidth - 55;
  var y = canvas.height - 60;

  $('#screen-viewer').width(x);
  $('#screen-viewer').height(y);

  var renderCanvas = frame.document.getElementById('renderCanvas');
  if (renderCanvas) {
    renderCanvas.width = x;
    renderCanvas.height = y;
  }
}

document.getElementById('collapse').addEventListener('click', function () {
  var notice = document.getElementById('notice');
  if (notice.classList.contains('on')) {
    $('#notice').animate({
      height: '8%',
      borderBottom: '0px solid gray',
    });
    $('.conversation-panel').animate({
      height: '88%',
    });
    console.log(this.children[0]);
    notice.children[0].style.borderBottom = '0px solid #ffffff';
    this.children[0].style.transform = 'rotate(0deg)';
  } else {
    $('#notice').animate({
      height: '50%',
      borderBottom: '0px solid gray',
    });
    $('.conversation-panel').animate({
      height: '48%',
    });
    notice.children[0].style.borderBottom = '1px solid #B8B8B8';
    this.children[0].style.transform = 'rotate(180deg)';
  }

  notice.classList.toggle('off');
  notice.classList.toggle('on');
});

function test() {
  console.log('test from iframe');
}


document.getElementById("top_record_video").addEventListener("click", function () {
  if (!this.classList.contains("on")) {
    screen_recorder._startCapturing();
  }
  else {
    screen_recorder._stopCapturing();
    this.classList.remove("on");
  }
})

function SendMute(){
  mute()
  connection.send({mute : 'on'})
}

function SendUnmute(id){
  unmute(id);
  connection.send({ 'unmute': id })
}

function mute() {
  connection.streamEvents.selectAll().forEach(function (e) {
    console.log(e);

    if (e.userid != classroomInfo.nowMicPermission )
      if(!e.extra.roomOwner) {
      console.log(e.userid,"MUTE")
      e.stream.mute("audio");
    }
  });
}

function unmute(id) {
  connection.streamEvents.selectAll().forEach(function (e) {
    if (e.userid == id && e.type != "local") {
      console.log(e.userid,"UNMUTE")
      e.stream.unmute("audio");
    }
  });
}

function fileUploadModal(message, callback) {
  console.log(message);
  getUploadFileList();
  $('#btn-confirm-action').html('확인').unbind('click').bind('click', function (e) {
      e.preventDefault();
      $('#confirm-box').modal('hide');
      $('#confirm-box-topper').hide();
      callback(true);
  });

  $('#btn-confirm-close').html('취소');

  $('.btn-confirm-close').unbind('click').bind('click', function (e) {
      e.preventDefault();
      $('#confirm-box').modal('hide');
      $('#confirm-box-topper').hide();
      callback(false);
  });

  $('#confirm-message').html('<form name="upload" method="POST" enctype="multipart/form-data" action="/upload/"><input id="file-explorer" type="file" multiple></form>');
  $('#confirm-title').html('파일 관리자');
  $('#confirm-box-topper').show();

  $('#confirm-box').modal({
      backdrop: 'static',
      keyboard: false
  });
  loadFileInput();
}


function getUploadFileList(){
  var xhr = new XMLHttpRequest();
  console.log(uploadServerUrl);
  var url = uploadServerUrl+'/list';
  var data = { "userId" : params.sessionid };
  xhr.open("POST", url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
  if (xhr.readyState == 4 && xhr.status == 200) {
      // do something with response
      updateFileList(JSON.parse(xhr.responseText));
  }
  };
  data = JSON.stringify(data);
  xhr.send(data); 
}

function updateFileList(list){
  console.log(list.files);
  $("#confirm-message .list-group-flush").remove();
  var re = /(?:\.([^.]+))?$/;
  var listElement = '<ul class="list-group-flush">';
  list.files.forEach(file => {
    listElement+= '<li class="list-group-item"><p class="mb-0"><span class="file-other-icon">'+getFileType(re.exec(file.name)[1])+'</span><label>'+file.name+'</label><button type="button" class="btn btn-primary btn-lg pull-right float-right" onclick="loadFileViewer(\''+file.url+'\')"><i class="fa fa-folder float-right"></i></button><button type="button" class="btn btn-danger btn-lg pull-right float-right" onclick="deleteUploadedFile(\''+file.name+'\')"><i class="fa fa-trash float-right"></i></button></p></li>';
  })
  listElement+= '</ul>';
  var $listElement = $($.parseHTML(listElement));
  $("#confirm-message").prepend($listElement);
  //document.getElementById('confirm-message').append($listElement);
}

function getFileType(ext){
  console.log("ext:",ext);
  let element='';
  if (ext === undefined){
    element += '<i class="fas fa-folder text-primary"></i>';
  }
  else if(ext.match(/(doc|docx)$/i)){
    element += '<i class="fas fa-file-word text-primary"></i>';
  }
  else if(ext.match(/(xls|xlsx)$/i)){
    element += '<i class="fas fa-file-excel text-success"></i>';
  }
  else if(ext.match(/(ppt|pptx)$/i)){
    element += '<i class="fas fa-file-powerpoint text-danger"></i>';
  }
  else if(ext.match(/(pdf)$/i)){
    element += '<i class="fas fa-file-pdf text-danger"></i>';
  }
  else if(ext.match(/(zip|rar|tar|gzip|gz|7z)$/i)){
    element += '<i class="fas fa-file-archive text-muted"></i>';
  }
  else if(ext.match(/(htm|html)$/i)){
    element += '<i class="fas fa-file-code text-info"></i>';
  }
  else if(ext.match(/(txt|ini|csv|java|php|js|css)$/i)){
    element += '<i class="fas fa-file-code text-info"></i>';
  }
  else if(ext.match(/(avi|mpg|mkv|mov|mp4|3gp|webm|wmv)$/i)){
    element += '<i class="fas fa-file-video text-warning"></i>';
  }
  else if(ext.match(/(mp3|wav)$/i)){
    element += '<i class="fas fa-file-audio text-warning"></i>';
  }
  else if(ext.match(/(jpg)$/i)){
    element += '<i class="fas fa-file-image text-danger"></i>';
  }
  else if(ext.match(/(gif)$/i)){
    element += '<i class="fas fa-file-image text-muted"></i>';
  }
  else if(ext.match(/(png)$/i)){
    element += '<i class="fas fa-file-image text-primary"></i>' ;
  }
  else {
    element += '<i class="fas fa-file text-muted"></i>' ;
  }
  console.log(element);

  return element;
}

function deleteUploadedFile(filename){
  var xhr = new XMLHttpRequest();
  var url = uploadServerUrl+'/delete';
  var data = {"userId":params.sessionid, "name":filename};
  xhr.open("POST", url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
          // do something with response
          getUploadFileList();
      }
  };
  data = JSON.stringify(data);
  xhr.send(data);
}

function loadFileInput(){

  $(document).ready(function () {
    $("#test-upload").fileinput({
        'theme': 'fas',
        'showPreview': true,
        'language': 'kr',
        'allowedFileExtensions': ['*'],
        'fileType': "any",
        'previewFileIcon': "<i class='glyphicon glyphicon-king'></i>",
        'elErrorContainer': '#errorBlock'
    });
    $("#file-explorer").fileinput({
        'theme': 'explorer-fas',
        'language': 'kr',
        'uploadUrl': 'https://files.primom.co.kr:1443/upload',
        fileActionSettings : {
          showZoom : false,
        },
          
          
        overwriteInitial: false,
        initialPreviewAsData: true,
        initialPreview: [
            // "https://files.primom.co.kr/test.pdf",
            // "https://files.primom.co.kr/epub/fca2229a-860a-6148-96fb-35eef8b43306/Lesson07.epub/ops/content.opf",
            // "https://files.primom.co.kr/small.mp4"
        ],
        initialPreviewConfig: [
            // {caption: "test.pdf", size: 329892, width: "120px", url: "{$url}", key: 1},
            // {caption: "Lesson1.epub", size: 872378, width: "120px", url: "{$url}", key: 2},
            // {caption: "small.mp4", size: 632762, width: "120px", url: "{$url}", key: 3}
        ],
        preferIconicPreview: true, // this will force thumbnails to display icons for following file extensions
        previewFileIconSettings: { // configure your icon file extensions
       'doc': '<i class="fas fa-file-word text-primary"></i>',
       'xls': '<i class="fas fa-file-excel text-success"></i>',
       'ppt': '<i class="fas fa-file-powerpoint text-danger"></i>',
       'pdf': '<i class="fas fa-file-pdf text-danger"></i>',
       'zip': '<i class="fas fa-file-archive text-muted"></i>',
       'htm': '<i class="fas fa-file-code text-info"></i>',
       'txt': '<i class="fas fa-file-text text-info"></i>',
       'mov': '<i class="fas fa-file-video text-warning"></i>',
       'mp3': '<i class="fas fa-file-audio text-warning"></i>',
       // note for these file types below no extension determination logic 
       // has been configured (the keys itself will be used as extensions)
       'jpg': '<i class="fas fa-file-image text-danger"></i>', 
       'gif': '<i class="fas fa-file-image text-muted"></i>', 
       'png': '<i class="fas fa-file-image text-primary"></i>'    
   },
   previewFileExtSettings: { // configure the logic for determining icon file extensions
       'doc': function(ext) {
           return ext.match(/(doc|docx)$/i);
       },
       'xls': function(ext) {
           return ext.match(/(xls|xlsx)$/i);
       },
       'ppt': function(ext) {
           return ext.match(/(ppt|pptx)$/i);
       },
       'zip': function(ext) {
           return ext.match(/(zip|rar|tar|gzip|gz|7z)$/i);
       },
       'htm': function(ext) {
           return ext.match(/(htm|html)$/i);
       },
       'txt': function(ext) {
           return ext.match(/(txt|ini|csv|java|php|js|css)$/i);
       },
       'mov': function(ext) {
           return ext.match(/(avi|mpg|mkv|mov|mp4|3gp|webm|wmv)$/i);
       },
       'mp3': function(ext) {
           return ext.match(/(mp3|wav)$/i);
       }
   },
   uploadExtraData: {
    userId: params.sessionid
  },

    }).on('fileuploaded', function(event, previewId, index, fileId) {
      console.log('File Uploaded', 'ID: ' + fileId + ', Thumb ID: ' + previewId);
      console.log(previewId.response);
      getUploadFileList();
  }).on('fileuploaderror', function(event, data, msg) {
      console.log('File Upload Error', 'ID: ' + data.fileId + ', Thumb ID: ' + data.previewId);
  }).on('filebatchuploadcomplete', function(event, preview, config, tags, extraData) {
      console.log('File Batch Uploaded', preview, config, tags, extraData);
  });
});

}