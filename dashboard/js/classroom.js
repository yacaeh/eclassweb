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
var conversationPanel = document.getElementById('conversation-panel');

var connection = new RTCMultiConnection();
console.log('Connection!');

// function printHarryPotter(){ console.log("Harry Potter!"); }
// function printDawnOfDead(){ console.log("Dawn Of Dead!"); }
// module.exports.HarryPotter = printHarryPotter;
// module.exports.DawnOfDead = printDawnOfDead;​

window._points = {};

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

var topButtonContents = {
  top_all_controll : "전체 제어",
  top_test         : "시험",
  top_alert        : "알림",
  top_student      : "학생 목록",
  top_camera       : "선생님 카메라",
  top_save_alert   : "알림 기록 저장",
  top_record_video : "화면 녹화"
}

function CreateTopTooltip(data){
  Object.keys(data).forEach(function(id){
    var element = document.getElementById(id);
      element.addEventListener("mouseover" ,function(e){
      document.getElementById("toptooltip").style.display = 'block';

      var tooltip = document.getElementById("toptooltip")
      tooltip.children[0].innerHTML  = data[id];
      var x = e.target.x;
      var width = tooltip.getBoundingClientRect().width / 2;
      tooltip.style.left = e.target.getBoundingClientRect().x + (e.target.getBoundingClientRect().width /2) - width  + "px";
        
      element.addEventListener("mouseleave", function(){
        document.getElementById("toptooltip").style.display = 'none';

      })
    
    })
  });
}
CreateTopTooltip(topButtonContents);

SetCanvasBtn('screen_share', ScreenShare);
SetCanvasBtn('3d_view', _3DCanvasOnOff);
SetCanvasBtn('movie', Movie_Render_Button);
SetCanvasBtn('file', LoadFile);
SetCanvasBtn('epub', LoadEpub);
SetCanvasBtn('callteacher', CallTeacher);
SetCanvasBtn('homework', HomeworkSubmit);

SetEpubNavigator();

var isSharingScreen = false;
var isSharing3D = false;
var isSharingMovie = false;
var isSharingFile = false;
var isSharingEpub = false;
let isFileViewer = false;
let extraPath = '';
let currentPdfPage = 0;

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
  
  ClearCanvas();
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
  var names = [];

  connection.getAllParticipants().forEach(function (pid) {
    names.push(getFullName(pid));
  });

  if (!names.length) {$('#nos').text('0');
  } else {
    $('#nos').text(names.length);
  }

};




connection.onopen = function (event) {
  console.log('onopen!');


  SetStudentList(event,true);

  connection.onUserStatusChanged(event);
  if (designer.pointsLength <= 0) {
    setTimeout(function () {
      connection.send('plz-sync-points');
    }, 1000);
  }

  // 접속시 방정보 동기화.
  if (connection.extra.roomOwner) {
    //  mute();
  }

  //  session 연결 완료
  classroomCommand.onConnectionSession (event);

  if(classroomInfoLocal.shareScreen.fromme){
    ReTrack(GetScreenViewer().srcObject)
  }
};

connection.onclose = connection.onerror = connection.onleave = function (event){
  console.log('on close!');
  connection.onUserStatusChanged(event);
  SetStudentList(event, false);
};

connection.onmessage = function (event) {
  if(event.data.unmute){
    permissionManager.unmute(event.data.unmute);
    return;
  }

  if(event.data.mute){
    permissionManager.mute();
    return;

  }

  if(event.ReTrack){
    ReTrack(GetStream(classroomInfoLocal.shareScreen.id));
  }

  if(event.data.sendStudentPoint){
    event.data.command = "default";
    designer.syncData(event.data);
    console.log(event.data)
  }

  if(event.data.permissionChanged){
    classroomInfo = event.data.permissionChanged;

    console.log(event.data.permissionChanged);

    if(event.data.permissionChanged.classPermission)
      permissionManager.setClassPermission(event.data.permissionChanged.classPermission);
    else
      permissionManager.disableClassPermission();

    if(event.data.permissionChanged.micPermission)
      permissionManager.setMicPermission(event.data.permissionChanged.micPermission);
    else
      permissionManager.disableMicPermission();
  
    if(event.data.permissionChanged.canvasPermission)
      permissionManager.setCanvasPermission(event.data.permissionChanged.canvasPermission);
    else{
      permissionManager.disableCanvasPermission();
    }
  }



  if (event.data.showMainVideo) {
    ClearCanvas();
    classroomInfoLocal.shareScreen.state = true;
    classroomInfo.shareScreen = {}
    classroomInfo.shareScreen.state = true;
    classroomInfo.shareScreen.id = event.data.showMainVideo;
    classroomInfo.shareScreen.userid = event.userid;

    console.log("SCREEN SHARE START",event.data.showMainVideo)
    var stream = GetStream(event.data.showMainVideo)
    showScreenViewerUI();
    GetScreenViewer().srcObject = stream;
    return;
  }

  if (event.data.hideMainVideo) {
    console.log("SCREEN SHARE STOPED", event.userid)
    $(GetScreenViewer()).hide();
    classroomCommand.setShareScreenLocal ({state : false , id : undefined});
    return;
  }

  if (event.data.roomSync) {
    classroomCommand.receiveSyncRoomInfo(event.data.roomSync);
    console.log(classroomInfo)
    return;
  }

  if (event.data.chatMessage) {
    appendChatMessage(event);
    return;
  }
  // 학생 접속시 싱크
  if (event.data === 'plz-sync-points') {
    console.log("Sync! when connect !");
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
    console.log("SYNC", classroomInfo);
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
    
    if(connection.extra.roomOwner)
      attentionObj.submit({userid:event.data.alertResponse.userid, name :  params.userFullName, response : event.data.alertResponse.response });
    
    return;
  }

  if(event.data.getpointer){
    PointerSaver.send(event.data.idx);
    return;
  }

  if(event.data.setpointer){
    if(event.data.idx == "empty")
      return;
      event.data.data.command = "load";
    
    if(event.extra.roomOwner && !connection.extra.roomOwner){
      if(PointerSaver.nowIdx == event.data.idx){
        designer.syncData(event.data.data);
      }
    }
    else{
      event.data.data.isStudent = true;
      if(PointerSaver.nowIdx == event.data.idx){
        designer.syncData(event.data.data);
      }
    }


    return;
  }

  if (event.data.exam) {
    // 시험치기..
    examObj.receiveExamData(event.data.exam);
    return;
  }

  if(event.data.viewer) {
    console.log(event.data)

    ClearCanvas();
    ClearStudentCanvas();
    ClearTeacherCanvas();

    classroomCommand.updateViewer (event.data.viewer);
    return;    
  }

  if (event.data.epub) {
    classroomCommand.receiveEpubMessage(event.data.epub);
    return;
  }

  if(event.data.studentStreaming){
    console.log("Student Start Streaming");
    StreamingStart(event.data.studentStreaming)
  }

  //3d 모델링 Enable
  if (event.data.modelEnable) {
    ClearCanvas();
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
    ClearCanvas();

    var moveURL = event.data.MoiveURL;
    if (moveURL.type == 'YOUTUBE')
      embedYoutubeContent(moveURL.enable, moveURL.url, false);
    else if (moveURL.type == 'VIDEO')
      VideoEdunetContent(moveURL.enable, moveURL.url, false);
    else iframeEdunetContent(moveURL.enable, moveURL.url, false);
    return;
  }

  // 학생이 선생님에게 내가 다른곳을 보고 있다고 보고한다.
  if(event.data.onFocus){
    if(connection.extra.roomOwner){
      classroomCommand.receivedOnFocusResponse( { userId : event.data.onFocus.userid, onFocus: event.data.onFocus.focus });
    }
      
    return;
  }

  // 학생이 선생님에게 권한 요청을 한다.
  if( event.data.callTeacher ){
    if(connection.extra.roomOwner)
      classroomCommand.receivedCallTeacherResponse(event.data.callTeacher.userid);
    return;
  }

  if(event.data.closeTesting){
    if(!connection.extra.roomOwner){
      $('#exam-board').hide(300);
    }
    if(isMobile)
      document.getElementById("widget-container").style.right = "0px";
    else
      document.getElementById("widget-container").removeAttribute("style")
  }

  // if(!connection.extra.roomOwner){
    // console.log(event.data);
  // }

  if(event.data.pageidx == PointerSaver.nowIdx){
    designer.syncData(event.data);
  }
};

var stemp;

// extra code
connection.onstream = function (event) {
  console.log('onstream!',event);

  if(params.open === 'true' || params.open === true){
    CanvasResize();
    permissionManager.mute();
  }
  else{
  }

  LoadScreenShare();

  if (event.stream.isScreen && !event.stream.canvasStream) {
    if (!classroomInfoLocal.shareScreen.state) {
      $(GetScreenViewer()).hide();
    }
  } 
  else if (event.extra.roomOwner === true || connection.peers[event.userid].extra.roomOwner) {

    if(connection.extra.roomOwner && event.type =="remote")
      return;

    if(event.streamid.includes("-"))
      return;

    
    var video = GetMainVideo();


    console.log("MAIN VIDEO CHANGED", event);
    video.setAttribute('data-streamid', event.streamid);
    if (event.type === 'local') {
      // video.muted = true;
      video.volume = 0;
    }

    video.srcObject = event.stream;
  } 
  else if(event.stream.isVideo){
    try{
      if(event.streamid.includes("-") || !connection.extra.roomOwner){
        return false;
      }

      event.mediaElement.controls = false;
      event.mediaElement.style.width = "100%";
      event.mediaElement.style.height = "100%";
      event.mediaElement.style.pointerEvents = "none";
      event.mediaElement.style.position = "absolute";

      var otherVideos = document.getElementById("student_list");
      var childern = otherVideos.children;
      for(var i =0 ; i< childern.length; i++){
        var child = childern[i];
        if(child.dataset.id == event.userid){
          child.appendChild(event.mediaElement);
          break;
        }
      }
    }
    catch{
      console.log("No Cam")
    }
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

  if(connection.extra.roomOwner && 
     classroomInfo.shareScreen.id == event.streamid){
       console.error("Streamer has exited");
       event.stream.getTracks().forEach((track) => track.stop());
       hideScreenViewerUI();
       connection.send({hideMainVideo: true});
       classroomCommand.StopScreenShare();
       classroomCommand.setShareScreenServer(false, () => {
          console.log("Streaming Finish")
       });
    }

};


function appendChatMessage(event, checkmark_id) {
  var div = document.createElement('div');

  div.className = 'message';

  try {
    if (event.extra.roomOwner) {
      var notice = document.getElementById('noticewindow');
      $(notice).append(
        "<div class='teachermsg'> <font color='#C63EE8'> 선생님 </font> : " +
          ConvertChatMsg(event.data.chatMessage) +
          '</div>'
      );
      notice.scrollTop = notice.clientHeight;
      notice.scrollTop = notice.scrollHeight - notice.scrollTop;
    }
  } catch {}

  // Another
  if (event.data) {
    var id = event.extra.userFullName || event.userid;
    if (event.extra.roomOwner == true) {
      id += '(선생님)';
      id = '<font color="#C63EE8">' + id + '</font>';
    }

    div.innerHTML =
      '<b>' + id + '</b> : ' + ConvertChatMsg(event.data.chatMessage);
    if (event.data.checkmark_id) {
      connection.send({
        checkmark: 'received',
        checkmark_id: event.data.checkmark_id,
      });
    }
  } else {
    div.innerHTML = '<b> <font color="#3E93E8"> 나 </font>: </b>' + ConvertChatMsg(event);

    if (params.open === 'true' || params.open === true) {
      var notice = document.getElementById('noticewindow');
      $(notice).append(
        "<div class='teachermsg'> <font color='#C63EE8'> 선생님 </font> : " +
          ConvertChatMsg(event) +
          '</div>'
      );
      notice.scrollTop = notice.clientHeight;
      notice.scrollTop = notice.scrollHeight - notice.scrollTop;
    }
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

  var tempStreamCanvas = document.createElement('canvas');
  var tempStream = tempStreamCanvas.captureStream();
  tempStream.isScreen = true;
  tempStream.isSS = true;
  tempStream.streamid = tempStream.id;
  tempStream.type = 'local';
  connection.attachStreams.push(tempStream);
  window.tempStream = tempStream;

  if (params.open === true || params.open === 'true') {
    console.log('Opening Class!');
    SetTeacher(); 
    
    connection.extra.roomOwner = true;
    connection.open(params.sessionid, function (isRoomOpened, roomid, error) {
      if (error) {
        connection.rejoin(params.sessionid);
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
            // alert(
              // 'This room does not exist. Please either create it or wait for moderator to enter in the room.'
            // );
            location.reload();

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
        console.log(classroomInfo);
      }
    );
  }

  setTimeout(mobileHelper.Init(),1000);
});

function addStreamStopListener(stream, callback) {
  stream.addEventListener(
    'ended',
    function () {
      callback();
      callback = function () { };
    },
    false
  );

  stream.addEventListener(
    'inactive',
    function () {
      classroomInfo.shareScreen.state = false;
      classroomInfoLocal.shareScreen.fromme = false;
      console.log("Off Sharing");
      callback();
      callback = function () { };
    },
    false
  );

  stream.getTracks().forEach(function (track) {
    track.addEventListener(
      'ended',
      function () {
        console.log("3");
        callback();
        callback = function () { };
      },
      false
    );

    track.addEventListener(
      'inactive',
      function () {
        console.log("4");
        callback();
        callback = function () { };
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

function replaceScreenTrack(stream, btn) {
  ClearCanvas();
  console.log("Stream Start",tempStream.streamid);
  classroomCommand.setShareScreenLocal ({state : true , id : tempStream.streamid});
  classroomInfoLocal.shareScreen.fromme = true;


  GetScreenViewer().srcObject = stream;

  if(connection.extra.roomOwner){
    classroomInfo.shareScreen = {}
    classroomInfo.shareScreen.state = true
    classroomInfo.shareScreen.id = tempStream.streamid
  }

  classroomCommand.setShareScreenServer (true, result => {
  stream.isScreen = true;
  stream.streamid = stream.id;
  stream.type = 'local';


  connection.onstream({
    stream: stream,
    type: 'local',
    ScreenShare: true,
    streamid: stream.id,
  });

  
  connection.send({
    showMainVideo: tempStream.streamid,
  });

  StreamingStart(stream, btn);
  });
}

function StreamingStart(stream, btn){
  window.shareStream = stream;  
  var screenTrackId = stream.getTracks()[0].id;

  addStreamStopListener(stream, function () {    
    console.log("STOP SHARE")

    classroomCommand.StopScreenShare();

    classroomCommand.setShareScreenServer(false, () => {
      connection.send({hideMainVideo: true});
      if(btn != undefined){
        $(btn).removeClass("on");
        $(btn).removeClass("selected-shape");
      }
      isSharingScreen = false;
      window.sharedStream = null;
      hideScreenViewerUI();
      replaceTrack(tempStream.getTracks()[0], screenTrackId);
    });
  });
  


  ReTrack(stream);
  showScreenViewerUI ();

}

function ReTrack(stream){
  console.log("RE TRACK",stream.streamid);
  stream.getTracks().forEach(function (track) {
    if (track.kind === 'video' && track.readyState === 'live') {
      replaceTrack(track);
    }
  });
}


function showScreenViewerUI() {
  CanvasResize();
  GetScreenViewer().style.display = 'block';
}

function hideScreenViewerUI() {
  GetScreenViewer().style.display = 'none';
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
  let frame = document
  .getElementById('widget-container')
  .getElementsByTagName('iframe')[0].contentWindow;

    $('#session-id').text(connection.extra.userFullName+" ("+params.sessionid+")");
    $("#my-name").remove();
    $(".for_teacher").show();
    $(".controll").show();
    $(".feature").show();
  $(frame.document.getElementById("callteacher")).remove();
  $(frame.document.getElementById("homework")).remove();

}

function SetStudent() {

  $('#session-id').text(connection.extra.userFullName + '(' + params.sessionid + ')');
  $(".for_teacher").remove();

  GetMainVideo().style.display = 'block';
  $('#my-name').text('학생 이름 : ' + connection.extra.userFullName);
  $('.for_teacher').hide();
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
  
}

SelectViewType();

function SetStudentList(event, isJoin) {
  if(!connection.extra.roomOwner)
    return;

    var id = event.userid;
    var name = event.extra.userFullName;

  if(isJoin){
    console.log("JOIN ROOM", id, name);
    var div = $(' <span data-id="' + id + '" data-name="' + name + '" class="student">\
                <span class="student-overlay"></span> \
                <span class="bor"></span> \
                <span class="name"><span class="alert alert_wait"></span>' + name + '</span></span>')
    OnClickStudent(div,id,name);
    $("#student_list").append(div);
  }
  else{

    var childern = document.getElementById("student_list").children;

    for(var i = 0 ; i < childern.length; i++){
      var child = childern[i];
      if(child.dataset.id == id){
        document.getElementById("student_list").removeChild(child);
        console.log("EXIT ROOM", id, name);
        break;
      }
    }

    if(id == classroomInfo.classPermission)
      classroomInfo.classPermission = undefined;

    if(id == classroomInfo.micPermission)
      classroomInfo.micPermission = undefined;

    if(id == classroomInfo.canvasPermission)
      classroomInfo.canvasPermission = undefined;
  }


}

function SelectViewType() {
  $('.view_type').click(function () {
    $('.view_type').removeClass('view_type-on');
    $(this).addClass('view_type-on');

    switch (this.id) {
      case 'top_student':
        GetMainVideo().style.display = "none";
        $('#student_list').show();
        break;
        case 'top_camera':
          GetMainVideo().style.display = "block";
        $('#student_list').hide();
        break;
    }
  });
}

$('#top_test').click(function () {
  
  if ($('#exam-board').is(':visible')) {
    if(examObj.closeTesting()){
      document.getElementById("widget-container").removeAttribute("style")
      $('#exam-board').hide(300);
    }else{
      alert("시험 종료 후 닫을 수 있습니다");
    }
  }
  else {
    // 선생님
    if (params.open === 'true') {
      document.getElementById("widget-container").style.right = "max(17.7%, 290px)";
      CanvasResize();
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
  if(m_QuesCount>200){
    alert("최대 문항수는 200개입니다");
    m_QuesCount = 200;
    $('#exam-question-count').val(m_QuesCount);
  }
  var answerList = getQuestionAnswerList();
  $('#exam-question-list').html('');
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

  $('#exam-teacher-timer').html(getFormatmmss(m_ExamTime));
  m_ExamTimerInterval = setInterval(function () {
    m_ExamTime--;
    examObj.updateExameTimer(m_ExamTime);
    $('#exam-teacher-timer').html(getFormatmmss(m_ExamTime));
    if (m_ExamTime <= 0) 
      finishExam();
  }, 1000);
});

function getFormatmmss(sceond){
  var mm = numberPad(parseInt(sceond / 60),2);
  var ss = numberPad(sceond % 60,2);
  return mm+":"+ss;
}

function numberPad(n, width) {
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

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
    stateHtmlStr += `<div style='display:flex; height:37px;'>`;
    stateHtmlStr += `<span class='exam-state-progress-number'>${i}.</span>`;
    stateHtmlStr += `<progress style='margin-top:16px; margin-left:13px; width:240px;' id="exam-state-progress-${i}" class='exam-state-progress'  value="0" max="100"></progress>`;
    stateHtmlStr += `<span class='exam-state-percent'  id='exam-state-percent-${i}'>0%</span><br>`;
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
  $(`#exam-state-percent-${num}`).html(Math.round(percent) + '%');
}

// 문제 html에 하나 추가 (apeend)
function apeendQuestion(i) {
  question = `<div id='exam-question-${i}' style='display: flex;'>`;

  question += `<span id='exam-question-text-${i}' class='text-center-bold' style='line-height: 43px; width:30px; text-align:right;'>${i}.</span>`;

  for (var j = 1; j <= 5; j++) {
    question += `<input type='radio' id='exam-question-${i}_${j}' name='exam-question-${i}' value='${j}'> `;
    question += `<label for='exam-question-${i}_${j}' style='flex:1;'>${j}</label>`;
  }

  question += `<button id='exam-question-delete-${i}' onclick='deleteQuestion(${i})' class='btn btn-exam text-center-bold' style='flex:1; padding: 0px 3px 3px 3px; margin:12px; height:20px; line-height:12px'>─</button>`;

  question += `</div>`;
  $('#exam-question-list').append(question);

  $(`#exam-question-${i}`).change(function () {
    $(`#exam-question-${i}`).css('background', '#eff1f0');
  });
}

// 문제 하나 제거
function deleteQuestion(num) {
  var answerList = getQuestionAnswerList();
  m_QuesCount--;
  answerList.splice(num - 1, 1);
  $('#exam-question-list').html('');
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
  if(isMobile){
    document.getElementById("widget-container").style.right = "max(0px, 290px)";
  }
  else{
    document.getElementById("widget-container").style.right = "max(17.7%, 290px)";
  }
  CanvasResize();


  $('#exam-omr').show();
  $('#exam-board').show();

  $('#exam-omr').html('');
  var question = '';

  question += "<div class='exam-header'>";
  question += "<div id='is-testing'>시험 중</div>";
  question += "<div id='exam-student-timer' style='color:red;'>0:0</div>";
  question += '</div>';
  question += "<div class='exam-overflow exam-border-bottom'>";
  question += "<div id='exam-omr-question-list'>";
  m_QuesCount = quesCount;
  for (var i = 1; i <= m_QuesCount; i++) {
    question += `<div id='exam-question-${i}' style='display:flex;' onchange='omrChange(${i})'>`;
    question += `<span id='exam-question-text-${i}' class='text-center-bold' style='line-height: 43px; width:30px; text-align:right;'>${i}.</span>`;
    for (var j = 1; j <= 5; j++) {
      question += `<input type='radio' id='exam-question-${i}_${j}' style='flex:5;' name='exam-question-${i}' value='${j}'> `;
      question += `<label for='exam-question-${i}_${j}'>${j}</label>`;
    }
    question += `<span id='exam-student-answer-${i}' class='text-center-bold' style='flex:1; line-height: 43px;'></span>`;
    question += `</div>`;
  }
  question += '</div>';
  question += `</div>`;
  question +=
    "<button onclick='submitOMR()' id='exam-answer-submit' class='btn btn-exam exam-80-button' onclick='finishExam()'>제출하기</button>";
  $('#exam-omr').html(question);
  
  examTime *= 60;
  $('#exam-student-timer').html(getFormatmmss(examTime));
  m_ExamTimerInterval = setInterval(function () {
    examTime--;
    examObj.updateExameTimer(examTime);
    $('#exam-student-timer').html(getFormatmmss(examTime));
    if (examTime <= 0) 
      finishExam();
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
  $('#is-testing').html("시험 종료");
  $('#exam-omr-question-list').css('pointer-events', 'none');
  $('#exam-answer-submit').hide();
}

// 학생 정답 표시
function markStudent(num, check, answer) {
  console.log(check);
  if (check === answer) {
    $(`#exam-question-${num}`).css('background-color', '#92ecc8');
  } else {
    $(`#exam-question-${num}`).css('background-color', '#fbccc4');
  }
  $(`#exam-student-answer-${num}`).html("("+answer+")");
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
 

  classroomCommand.exitAlert(function () {
    //history.back();
    var href = location.protocol + "//"+ location.host + "/dashboard/";
    window.open(href, "_self");
  });


  
});

$(window).on('beforeunload', function () {
  // return 1;
});

// 모달로 만들어서 pdf 선택 해야함
// 로드시 글자깨짐 현상 해결 해야함
// 소켓통신으로 제어 필요


function LoadFile(btn) {
  if (!isSharingFile && checkSharing()) {
    removeOnSelect(btn);
    return;
  }

  if(!connection.extra.roomOwner) 
    return;


  fileUploadModal("파일 관리자", btn ,function(e){console.log(e)});
}


function HomeworkSubmit(btn) {
  HomeworkUploadModal("숙제 제출",function(e){console.log(e)});
}

function unloadFileViewer() {
  console.log("UNLOAD FILEVIEWER");

  ClearCanvas();
  ClearStudentCanvas();
  ClearTeacherCanvas();

  PointerSaver.save();

  var btn = GetFrame().document.getElementById("file");
  btn.classList.remove("selected-shape");
  btn.classList.remove("on");

  isSharingFile = false;
  isFileViewer = false;
  classroomCommand.closeFile ();
}


function loadFileViewer(url) {
  ClearCanvas();
  ClearStudentCanvas();
  ClearTeacherCanvas();

  console.log('loadFileViewer');
  var btn = GetFrame().document.getElementById("file");
  btn.classList.add("selected-shape");
  btn.classList.add("on");
  isSharingFile = true;
  isFileViewer = true;  
  classroomCommand.openFile (url);
}


// Pdf가 처음 로딩이 다 되었는지 확인.
// 로딩이 다 된 후에 페이지 동기화
function pdfOnLoaded () {
  console.log("PDF ON");
  classroomCommand.onViewerLoaded ();
}

function showPage(n){
  PointerSaver.save()
  PointerSaver.load(n-1);
  console.log(n);

  currentPdfPage = n;
  if(connection.extra.roomOwner || !classroomInfo.allControl) 
    classroomCommand.onShowPage (n);
    // classroomCommand.setPdfPage(n);
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
    //classroomCommand.sendPDFCmdAllControlOnlyTeacher('zoomIn');
}

function zoomOut() {
   // classroomCommand.sendPDFCmdAllControlOnlyTeacher('zoomOut');
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

function CallTeacher() {
  connection.send({
    callTeacher :{
        userid : connection.userid
    } 
  });  
}

var renditionBuffer;


function SetEpubNavigator(){
  var navi = document.getElementById("epub-navi");
  var thumblist = document.getElementById("thumbnail-list");
  var epubidxinput = document.getElementById("epubidx");
  epubidxinput.addEventListener("change", function(e){
    var idx = Math.max(1, Math.min(document.getElementById("epubmaxidx").value, this.value));
    this.value = idx;
    rendition.display(idx-1);
  })

  navi.addEventListener("mousewheel", function(e){
    thumblist.scrollLeft += e.deltaY;
  })

  document.getElementById('prev').addEventListener('click',function () {
    rendition.prev();  
  });

  document.getElementById('next').addEventListener('click',function(){
    rendition.next();  
  });

  document.getElementById('lprev').addEventListener('click',function(){
    rendition.display(0);

  });

  document.getElementById('lnext').addEventListener('click',function(){
    rendition.display(document.getElementById("epubmaxidx").value-1);
  });

  document.getElementById("epub-collapse").addEventListener('click', function(){
    if(this.classList.contains("closed")){
      $(navi).animate({"height": "95%"});
      this.classList.remove("closed")
      this.style.transform = "rotate(-90deg)";
    }
    else{
      $(navi).animate({"height": "93px"});
      this.classList.add("closed")
      this.style.transform = "rotate(90deg)";
    }
  })
}

function loadEpubViewer() {
  ClearCanvas();

  PointerSaver.load(0);

  document.getElementById("epub-navi").style.display = "block";
  document.getElementById("epubidx").value = 1;
  

  isSharingEpub = true;
  isEpubViewer = true;
  console.log("Load Epub viewer");
  
  document.getElementById("widget-container").style.width - 50;

  let epubViewer = document.createElement('div');
  epubViewer.setAttribute('id', 'epub-viewer');
  epubViewer.setAttribute('class', 'spread');

  if(isMobile)
    epubViewer.style.width = "calc(100% - 52px)";

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
    'https://files.primom.co.kr:1443/uploads/epub/6da5303c-d218-67f1-8db1-2a8e5d2e5936/Lesson1.epub/ops/content.opf'
  );
  window.book = book;
  console.log(book);
  
  var rendition = book.renderTo(epubViewer, {
    // manager: 'paginated',
    flow: 'paginated',
    width: '50%',
    height: "100%",
    snap: true
  });

  window.rendition = rendition;


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
  });

  // Navigation loaded
  book.loaded.navigation.then(function (toc) {
    var len = book.spine.length;
    document.getElementById("epubmaxidx").value = len;
    document.getElementById("epubmaxidx").innerHTML = " / " + len;

    let origin = book.url.origin;
    let path = book.path.directory;
    let location = origin + path;
    console.log(location);

    let idx = 0;

    Object.keys(book.package.manifest).forEach(function(e){
      var href = book.package.manifest[e].href;
      if(href.includes("thumbnail")){


        var thumbnail = document.createElement("div");
        thumbnail.setAttribute("idx",idx);

        var img = document.createElement("img");
        img.src = location + href;
        thumbnail.className = "thumbnail";
        thumbnail.appendChild(img);

        thumbnail.addEventListener("click" ,function(){
          rendition.display(this.getAttribute("idx"))
        })

        document.getElementById("thumbnail-list").appendChild(thumbnail);
        idx ++;
      }
    })


  });

  rendition.on('relocated', function(locations) {    
    PointerSaver.save()
    PointerSaver.load(locations.start.index);

    var pre = document.getElementById("thumbnail-list").getElementsByClassName("selected")[0];
    if(pre)
      pre.classList.remove("selected");
      document.getElementById("thumbnail-list").children[locations.start.index].classList.add("selected");
      document.getElementById("thumbnail-list").children[locations.start.index].scrollIntoView({block : "center"});
      document.getElementById("epubidx").value = locations.start.index + 1;
      classroomCommand.sendEpubCmd('page', {
        page : locations.start.index
      });    

  });

  

  var keyListener = function (e) {
    // Left Key
    if ((e.keyCode || e.which) == 37) {
      prevPage();
    }

    // Right Key
    if ((e.keyCode || e.which) == 39) {
      nextPage()
    }
  };

  function nextPage(){
    rendition.next();  
  }
  
  function prevPage(){
    rendition.prev();  
  }

  rendition.on('keyup', keyListener);
  document.addEventListener('keyup', keyListener, false);
}

function unloadEpubViewer() {
  ClearCanvas();
  ClearTeacherCanvas();
  ClearStudentCanvas();

  PointerSaver.close();

  $("#thumbnail-list").empty();
  document.getElementById("epub-navi").style.display = "none";

  isSharingEpub = false;
  isEpubViewer = false;

  renditionBuffer = null;

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

// 알림 박스 생성
function alert_exit_Box(message, title, callback_yes, callback_no) {
  callback_yes = callback_yes || function () {};
  callback_no = callback_no || function () {};

  var clickCount = 0;

  $('.btn-alert-exit-yes')
    .unbind('click')
    .bind('click', function (e) {
      if (clickCount++ == 0) {
        e.preventDefault();
        $('#alert-exit').fadeOut(300);
        callback_yes();
      }
    });
  $('.btn-alert-exit-no')
    .unbind('click')
    .bind('click', function (e) {
      if (clickCount++ == 0) {
        e.preventDefault();
        $('#alert-exit').fadeOut(300);
        callback_no();
      }
    });

  $('#alert-exit-title').html(title || '알림');
  $('#alert-exit-content').html(message);
  $('#alert-exit').fadeIn(300);
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

  var x = canvas.width;
  var y = canvas.height;

  var renderCanvas = frame.document.getElementById('renderCanvas');
  if (renderCanvas) {
    renderCanvas.style.left = "50px";
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


document.getElementById("top_record_video").addEventListener("click", function () {
  if (!this.classList.contains("on")) {
    screen_recorder._startCapturing();
  }
  else {
    screen_recorder._stopCapturing();
    this.classList.remove("on");
  }
})


function GetStream(id){
  try{
    return connection.streamEvents[id].stream;
  }
  catch{
    console.error("Can't find stream", id);
    console.log(connection.streamEvents)
    return undefined;
  }   
}


function HomeworkUploadModal(message, callback){
  console.log(message);
  extraPath = '';
  $('#btn-confirm-close').hide();
  $('#btn-confirm-file-close').hide();
  $("#confirm-title2").hide();
  $('#confirm-title').html(message).removeClass("selected");

  $('#btn-confirm-action').html('닫기').unbind('click').bind('click', function (e) {
      e.preventDefault();
      $('#confirm-box').modal('hide');
      $('#confirm-box-topper').hide();
      callback(true);
  });

  $('#confirm-message').html('<form name="upload" method="POST" enctype="multipart/form-data" action="/upload/"><input id="file-explorer" type="file" multiple accept=".gif,.pdf,.odt,.png,.jpg,.jpeg,.mp4,.webm"></form>');
  $('#confirm-box-topper').show();

  $('#confirm-box').modal({
      backdrop: 'static',
      keyboard: false
  });

  loadFileInput();
}

function fileUploadModal(message, btn, callback) {
  console.log(message);
  extraPath = '';

  getUploadFileList();
  $("#confirm-title2").show();

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

  $('#confirm-message').html('<form name="upload" method="POST" enctype="multipart/form-data" action="/upload/"><input id="file-explorer" type="file" multiple accept=".gif,.pdf,.odt,.png,.jpg,.jpeg,.mp4,.webm"></form>');
  $('#confirm-title').html(message).addClass("selected");
  $('#confirm-title2').html("과제").removeClass("selected");
  $('#confirm-box-topper').show();

  $('#confirm-box').modal({
      backdrop: 'static',
      keyboard: false
  });
  if(!isFileViewer) $('#btn-confirm-file-close').hide();
  else {
    $('#btn-confirm-file-close').show();
    $('#btn-confirm-file-close').html('현재 파일 닫기').unbind('click').bind('click', function (e) {
      e.preventDefault();
      unloadFileViewer();
    });
    }

  loadFileInput();

}

document.getElementById("confirm-title").addEventListener("click",function(){
  console.log("CLICKED")
  ViewUploadList(this);
})

document.getElementById("confirm-title2").addEventListener("click",function(){
  ViewHomeworkList(this);
})

function ViewHomeworkList(btn){
  btn.classList.add("selected");
  document.getElementById("confirm-title").classList.remove("selected");
  $("form[name=upload]").hide();
  getUploadFileList("/homework");
}

function ViewUploadList(btn){
  btn.classList.add("selected");
  document.getElementById("confirm-title2").classList.remove("selected");
  $("form[name=upload]").show();
  getUploadFileList();
}


function getUploadFileList(extraPath){
  if(typeof extraPath === "undefined")
    extraPath = ""; 
  $("#confirm-message .list-group-flush").remove();

  var xhr = new XMLHttpRequest();
  var url = uploadServerUrl+'/list';
  var data = { "userId" : params.sessionid ,"extraPath":extraPath};
  xhr.open("POST", url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
  if (xhr.readyState == 4 && xhr.status == 200) {
      updateFileList(JSON.parse(xhr.responseText), extraPath);
  }
  };
  data = JSON.stringify(data);
  xhr.send(data); 
}

function updateFileList(list, extraPath){
  var re = /(?:\.([^.]+))?$/;
  var listElement = '<ul class="list-group-flush">';
  list.files.forEach(file => {

    if(file.name == "homework")
      return ;

    var buttons = "";
    if(extraPath == "/homework"){
      buttons = '<button type="button" class="btn btn-safe btn-lg pull-right float-right"  \
      onclick="downloadUploadedFile(\''  + file.url + '\' ,\'' + file.name + '\')"><i class="fa fa-download float-right"></i></button>';

    } 

    buttons +=  '<button type="button" class="btn btn-primary btn-lg pull-right float-right" \
    onclick="loadFileViewer(\''+file.url+'\')"><i class="fa fa-folder float-right"></i></button> \
    <button type="button" class="btn btn-danger btn-lg pull-right float-right" \
    onclick="deleteUploadedFile(\''  + file.name + '\' ,\'' + extraPath + '\')"><i class="fa fa-trash float-right"></i></button>';

    listElement+= '<li class="list-group-item"><p class="mb-0"><span class="file-other-icon">'+
    getFileType(re.exec(file.name)[1])+'</span><label>'+file.name+ 
    '</label>'  + buttons;
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

function downloadUploadedFile(url,name){
  fetch(url)
  .then(resp => resp.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  })
  .catch(() => alert('oh no!'));
}

function deleteUploadedFile(filename, extraPath){

  console.log(extraPath);

  var xhr = new XMLHttpRequest();

  var url = uploadServerUrl+'/delete';
  var data = {
    "userId":params.sessionid, 
    "name":filename,
    "extraPath" : extraPath
  };

  xhr.open("POST", url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
          // do something with response
          getUploadFileList(extraPath);
      }
  };
  data = JSON.stringify(data);
  xhr.send(data);
}

function loadFileInput(){

  $(document).ready(function () {
    var extraPath = "";

    if(!connection.extra.roomOwner)
      extraPath = "/homework";

    $("#test-upload").fileinput({
        'theme': 'fas',
        'showPreview': true,
        'language': 'kr',
        'allowedFileExtensions': ["jpg", "gif", "png", "mp4", "webm", "pdf", "jpeg","odt"],
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
    // userId: path
    userId: params.sessionid,
    extraPath : extraPath,
  },

    }).on('fileuploaded', function(event, previewId, index, fileId) {
      console.log('File Uploaded', 'ID: ' + fileId + ', Thumb ID: ' + previewId);
      console.log(previewId.response);
      if(connection.extra.roomOwner)
        getUploadFileList();
  }).on('fileuploaderror', function(event, data, msg) {
      console.log('File Upload Error', 'ID: ' + data.fileId + ', Thumb ID: ' + data.previewId);
  }).on('filebatchuploadcomplete', function(event, preview, config, tags, extraData) {
      console.log('File Batch Uploaded', preview, config, tags, extraData);
  });
});

}

var isFocused = true;
var isIframeFocused = false;

let widgetIframe = document
.getElementById('widget-container')
.getElementsByTagName('iframe')[0].contentWindow;


function sendFocus(state){
  if(!connection.extra.roomOwner){
    connection.send({
      onFocus :{
          userid : connection.userid,
          focus : state
      } 
    });
    if(!state){
      // alert('수업 째지 마세요...');
      console.log("You left class!");
    }  
  }
}

$(widgetIframe).on("blur focus", function(e){
  var prevType = $(this).data("prevType");

  if (prevType != e.type) {   //  reduce double fire issues
      switch (e.type) {
        case "blur":
          isIframeFocused = false;
          setTimeout(function(){
            if(!isFocused && !isIframeFocused){
              sendFocus(false);  
            }
            else{
              sendFocus(true);
            }  
          },100);
          break;
        case "focus":
          isIframeFocused = true;
          sendFocus(true);
          break;
      }
    }

  $(this).data("prevType", e.type);

})

$(window).on("blur focus", function(e) {
  var prevType = $(this).data("prevType");

  if (prevType != e.type) {   //  reduce double fire issues
      switch (e.type) {
          case "blur":
            isFocused = false;
            console.log("blur");
            if(document.activeElement !== frame){
            }
            else{
              isFocused = true;
              sendFocus(true);
            }
            break;
          case "focus":
            isFocused = true;
            sendFocus(true);
            break;
      }
  }

  $(this).data("prevType", e.type);
})

document.getElementById("top_save_alert").addEventListener('click' ,function(){
   if(!attentionObj.exportAttention())
        alert("저장할 데이터가 없습니다")
})


function handleDragDropEvent(oEvent) {
  if(oEvent.target.classList == "emojionearea-editor" || oEvent.target.id == "urlinput")
    return false;

  oEvent.preventDefault();
}

function LoadScreenShare(){
  if(classroomInfo.shareScreen.state && 
    classroomInfo.shareScreen.id != undefined &&
    !classroomInfoLocal.shareScreen.fromme){
    console.log("LOAD SCREEN")
    classroomCommand.openShare();
    CanvasResize();
  }
}

function syncWithTeacher(){
  connection.send('plz-sync-points');
  console.log("Sync!");
}

PermissionButtonSetting();


// Save classinfo on user exit
function saveClassInfo(){
console.log();
localStorage.setItem('sessionid', params.sessionid);
localStorage.setItem('points', params.sessionid);
localStorage.setItem('currentPage', currentPdfPage);
localStorage.setItem('isSharingScreen', isSharingScreen);
localStorage.setItem('isSharing3D', isSharing3D);
localStorage.setItem('isSharingMovie', isSharingMovie);
localStorage.setItem('isSharingFile', isSharingFile);
localStorage.setItem('isSharingEpub', isSharingEpub);
localStorage.setItem('isFileViewer', isFileViewer);

}

function loadClassInfo(){
  localStorage.getItem('sessionid', params.sessionid);
  localStorage.getItem('isSharingScreen', isSharingScreen);
  localStorage.getItem('isSharing3D', isSharing3D);
  localStorage.getItem('isSharingMovie', isSharingMovie);
  localStorage.getItem('isSharingFile', isSharingFile);
  localStorage.getItem('isSharingEpub', isSharingEpub);
  localStorage.getItem('isFileViewer', isFileViewer);
  
}

function removeClassInfo(){
  localStorage.removeItem('sessionid', params.sessionid);
  localStorage.removeItem('isSharingScreen', isSharingScreen);
  localStorage.removeItem('isSharing3D', isSharing3D);
  localStorage.removeItem('isSharingMovie', isSharingMovie);
  localStorage.removeItem('isSharingFile', isSharingFile);
  localStorage.removeItem('isSharingEpub', isSharingEpub);
  localStorage.removeItem('isFileViewer', isFileViewer);

}

function GetScreenViewer(){
  return GetFrame().document.getElementById("screen-viewer");
}

function GetMainVideo(){
  var video = document.getElementById("main-video");
  if(video){
    return video;
  }
  else{
     return GetFrame().document.getElementById("main-video");
  }
}

$(document).ready(function(){
})

function GetFrame(){
  let frame = document
  .getElementById('widget-container')
  .getElementsByTagName('iframe')[0].contentWindow;
  return frame;
}

