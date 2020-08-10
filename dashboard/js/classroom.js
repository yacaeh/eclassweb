/*
  메인
*/

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

var debug = false;
var canvas_array = {};
var isSharing3D = false;
var isSharingMovie = false;
var isSharingFile = false;
var isSharingEpub = false;
let isFileViewer = false;
let extraPath = '';
let currentPdfPage = 0;

// 상단 버튼 도움말
var topButtonContents = {
  top_all_controll: "전체 제어",
  top_test: "시험",
  top_alert: "알림",
  top_student: "학생 판서",
  top_camera: "학생 카메라",
  top_save_alert: "알림 기록 저장",
  top_record_video: "화면 녹화"
}

// 좌측 버튼 기능
var canvasButtonContents = {
  'screen_share': ScreenShare,
  '3d_view'     : _3DCanvasOnOff,
  'movie'       : Movie_Render_Button,
  'file'        : LoadFile,
  'epub'        : LoadEpub,
  'callteacher' : CallTeacher,
  'homework'    : HomeworkSubmit,
}

let uploadServerUrl = "https://files.primom.co.kr:1443";
var conversationPanel = document.getElementById('conversation-panel');

//=============================================================================================

var connection = new RTCMultiConnection();
console.log('Connection!');
connection.socketURL = '/';
connection.extra.userFullName = params.userFullName;
connection.publicRoomIdentifier = params.publicRoomIdentifier;
connection.socketMessageEvent = 'canvas-dashboard-demo';
connection.autoCloseEntireSession = false;
connection.maxParticipantsAllowed = 1000;
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

if (!!params.password) {
  connection.password = params.password;
}


// 상단 도움말 추가
CreateTopTooltip(topButtonContents);

// 학생 권한 Form 세팅
permissionManager.init();

// 페이지 탐색기 초기화
PageNavigator.init();

// 스크린 공유 초기화
SettingForScreenShare();

// 선생님 학생 <-> 캠 보기 Toggle
ToggleViewType();

// 전체 제어 On OFF
_AllCantrallFunc();

// 채팅 초기화
SettingForChatting();

//시험치기 초기화
examObj.init();


AddEvent("confirm-title", "click", function (self) {
  ViewUploadList(self);
})

AddEvent("confirm-title2", "click", function (self) {
  ViewHomeworkList(self);
})

AddEvent("top_save_alert", "click", function () {
  if (!attentionObj.exportAttention())
    alert("저장할 데이터가 없습니다")
})

AddEvent("icon_exit", "click", function () {
  classroomCommand.exitAlert(function () {
    var href = location.protocol + "//" + location.host + "/dashboard/";
    window.open(href, "_self");
  });
})

AddEvent("top_alert", "click", function () {
  classroomCommand.sendAlert(function () {
    var chilldren = document.getElementById('student_list').children;
    for (var i = 0; i < chilldren.length; i++) {
      var al = chilldren[i].getElementsByClassName('bor')[0];
      al.className = "bor";
      al.classList.add('alert_wait');
    }
  });
})

AddEvent("top_record_video", "click", function (self) {
  if (!self.classList.contains("on")) {
    screen_recorder._startCapturing();
  }
  else {
    screen_recorder._stopCapturing();
    self.classList.remove("on");
  }
})

window.addEventListener('resize', function () {
  rtime = new Date();
  if (timeout === false) {
    timeout = true;
    setTimeout(resizeend, delta);
  }
});

// 캔버스가 불러와졌을 때
window.onWidgetLoaded = function () {
  WindowFocusChecker();
  SendCanvasDataToOwner();
  SetCanvasBtn(canvasButtonContents);
  SetShortcut(shortCut);
  mobileHelper.Init();
}

connection.onopen = function (event) {
  console.log('onopen!', event.extra.userFullName, event.userid);
  JoinStudent(event);
  connection.send('plz-sync-points', event.userid);
  classroomCommand.onConnectionSession(event);
  if (classroomInfoLocal.shareScreen.fromme) {
    ReTrack(GetScreenSharingCanvas().srcObject)
  }
};

connection.onclose = connection.onerror = connection.onleave = function (event) {
  console.log('onclose!', event);
  LeftStudent(event);
};

connection.onmessage = function (event) {
  if (debug)
    console.log(event);

  if(permissionManager.eventListener(event))
    return;


  if (event.data.canvassend) {
    canvas_array[event.userid].src = event.data.canvas;
    return;
  }

  if (event.ReTrack) {
    ReTrack(GetStream(classroomInfoLocal.shareScreen.id));
    return;
  }

  if (event.data.sendStudentPoint) {
    event.data.command = "default";
    designer.syncData(event.data);
    return;
  }


  if (event.data.showMainVideo) {
    console.log("SCREEN SHARE START", event.data.showMainVideo)

    ClearCanvas();
    ClearStudentCanvas();
    ClearTeacherCanvas();
    classroomInfoLocal.shareScreenByStudent = true;
    classroomInfoLocal.shareScreen.state = true;
    classroomInfo.shareScreen = {}
    classroomInfo.shareScreen.state = true;
    classroomInfo.shareScreen.id = event.data.showMainVideo;
    classroomInfo.shareScreen.userid = event.userid;

    var stream = GetStream(event.data.showMainVideo)
    showScreenViewerUI();
    GetScreenSharingCanvas().srcObject = stream;
    return;
  }

  if (event.data.hideMainVideo) {
    console.log("SCREEN SHARE STOPED", event.userid)
    classroomInfoLocal.shareScreenByStudent = false;
    $(GetScreenSharingCanvas()).hide();
    classroomCommand.setShareScreenLocal({ state: false, id: undefined });
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

  if (event.data === 'plz-sync-points') {
    console.log("Sync! when connect ! with" ,event.userid);
    designer.sync();
    return;
  }

  if (event.data.studentCmd) {
    classroomCommand.onStudentCommand(event.data.studentCmd);
    return;
  }

  if (event.data.roomInfo) {
    classroomCommand.onReceiveRoomInfo(event.data);
    console.log("SYNC", classroomInfo);
    return;
  }

  if (event.data.allControl) {
    onAllControlValue(event.data.allControl);
    return;
  }

  if (event.data.alert) {
    classroomCommand.receivAlert();
    return;
  }

  if (event.data.alertResponse) {
    classroomCommand.receiveAlertResponse(event.data.alertResponse);
    if (connection.extra.roomOwner)
      attentionObj.submit({ userid: event.data.alertResponse.userid, name: params.userFullName, response: event.data.alertResponse.response });
    return;
  }

  if (event.data.getpointer) {
    PointerSaver.send(event.data.idx);
    return;
  }

  if (event.data.setpointer) {
    if (event.data.idx == "empty")
      return;
    event.data.data.command = "load";

    if (event.extra.roomOwner && !connection.extra.roomOwner) {
      if (PointerSaver.nowIdx == event.data.idx) {
        designer.syncData(event.data.data);
      }
    }
    else {
      event.data.data.isStudent = true;
      if (PointerSaver.nowIdx == event.data.idx) {
        designer.syncData(event.data.data);
      }
    }
    return;
  }

  if (event.data.exam) {
    examObj.receiveExamData(event.data.exam);
    return;
  }

  if (event.data.viewer) {
    if (event.data.viewer.cmd == "close") {
      PageNavigator.off();
    }


    if(!(event.data.viewer.cmd == "pause" || event.data.viewer.cmd == "play")){
      ClearCanvas();
      ClearStudentCanvas();
      ClearTeacherCanvas();
    }

    classroomCommand.updateViewer(event.data.viewer);
    return;
  }

  if (event.data.epub) {
    classroomCommand.receiveEpubMessage(event.data.epub);
    return;
  }

  if (event.data.studentStreaming) {
    console.log("Student Start Streaming");
    StreamingStart(event.data.studentStreaming)
    return;
  }

  if (event.data.modelEnable) {
    ClearCanvas();
    ClearStudentCanvas();
    ClearTeacherCanvas();

    var enable = event.data.modelEnable.enable;
    setShared3DStateLocal(enable);
    return;
  }

  if (event.data.modelDisable) {
    remove3DCanvas();
    return;
  }

  //3d 모델링 상대값
  if (event.data.ModelState) {
    set3DModelStateData(
      event.data.ModelState.position,
      event.data.ModelState.rotation
    );
    return;
  }

  //동영상 공유
  if (event.data.MoiveURL) {
    console.log(event.data.MoiveURL);
    // ClearCanvas();
    isSharingMovie = event.data.MoiveURL.enable;

    var moveURL = event.data.MoiveURL;
    if (moveURL.type == 'YOUTUBE')
      embedYoutubeContent(moveURL.enable, moveURL.url, false);
    else if (moveURL.type == 'VIDEO')
      VideoEdunetContent(moveURL.enable, moveURL.url, false);
    else if (moveURL.type == 'GOOGLE_DOC_PRESENTATION')
      iframeGoogleDoc_Presentation(moveURL.enable, moveURL.url, false);
    else
      iframeEdunetContent(moveURL.enable, moveURL.url, false);

    return;
  }

  if (event.data.onFocus) {
      classroomCommand.receivedOnFocusResponse({ 
        userId: event.data.onFocus.userid, 
        onFocus: event.data.onFocus.focus });
    return;
  }

  if (event.data.callTeacher) {
      classroomCommand.receivedCallTeacherResponse(event.data.callTeacher.userid);
    return;
  }

  if (event.data.closeTesting) {
    if (!connection.extra.roomOwner) {
      $('#exam-board').hide(300);
      $(".right-tab").css("z-index", 3);
    }
    if (isMobile)
      document.getElementById("widget-container").style.right = "0px";
    else
      document.getElementById("widget-container").removeAttribute("style")
    return;
  }

  if (event.data.pageidx == PointerSaver.nowIdx) {
    designer.syncData(event.data);
  }
};

connection.onstream = function (event) {
  console.log('onstream!',event);

  if (params.open === 'true' || params.open === true) {
    permissionManager.mute();
  }

  LoadScreenShare();

  if (event.stream.isScreen && !event.stream.canvasStream) {
    if (!classroomInfoLocal.shareScreen.state) {
      $(GetScreenSharingCanvas()).hide();
    }
  }

  // 학생들 선생의 캠 세팅
  else if (event.extra.roomOwner || connection.peers[event.userid].extra.roomOwner) {

    if (connection.extra.roomOwner && event.type == "remote")
      return;

    if (event.streamid.includes("-"))
      return;

    var video = GetMainVideo();
    console.log("MAIN VIDEO CHANGED", event);
    video.setAttribute('data-streamid', event.streamid);

    if (event.type === 'local') {
      video.volume = 0;
    }

    video.srcObject = event.stream;
  }

  // 학생들 캠 추가
  else if (event.stream.isVideo) {
    try {
      if (event.streamid.includes("-") || !connection.extra.roomOwner) {
        return false;
      }

      event.mediaElement.controls = false;
      event.mediaElement.style.width = "100%";
      event.mediaElement.style.height = "100%";
      event.mediaElement.style.pointerEvents = "none";
      event.mediaElement.style.position = "absolute";

      if (classroomInfoLocal.showcanvas) {
        event.mediaElement.style.display = 'none';
      }

      var childern = document.getElementById("student_list").children;

      for (var i = 0; i < childern.length; i++) {
        var child = childern[i];
        if (child.dataset.id == event.userid) {
          child.appendChild(event.mediaElement);
          break;
        }
      }

    }
    catch{
      console.log("No Cam")
    }
  }
};

connection.setUserPreferences = function (userPreferences) {
  if (connection.dontAttachStream) {
    userPreferences.dontAttachLocalStream = true;
  }

  if (connection.dontGetRemoteStream) {
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

  if (connection.extra.roomOwner && classroomInfo.shareScreen.id == event.streamid) {
    console.error("Streamer has exited");
    event.stream.getTracks().forEach((track) => track.stop());
    hideScreenViewerUI();
    connection.send({ hideMainVideo: true });
    classroomCommand.StopScreenShare();
    classroomCommand.setShareScreenServer(false, () => {console.log("Streaming Finish")});
  }

};

designer.appendTo(document.getElementById('widget-container'), function () {
  console.log('designer append');
  if (params.open === true || params.open === 'true') {
    console.log('Opening Class!');
    SetTeacher();

    connection.extra.roomOwner = true;
    connection.open(params.sessionid, function (isRoomOpened, roomid, error) {


      if(!isRoomOpened){
        alert("이미 존재하는 방입니다.");
        var href = location.protocol + "//" + location.host + "/dashboard/";
        window.open(href, "_self");
      }
      else {
        console.error(isRoomOpened, roomid, error)
        if (error) {
          connection.rejoin(params.sessionid);
        }
  
        classroomCommand.joinRoom();
       
        connection.socket.on('disconnect', function () {
          console.log(isRoomOpened, roomid, error);
            location.reload();
        });
      }


    });
  } else {
    SetStudent();
    console.log('try joining!');
    connection.DetectRTC.load(function () {
    });

    connection.join(
      {
        sessionid: params.sessionid,
        userid: connection.channel,
        session: connection.session
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

        classroomCommand.joinRoom();
        connection.socket.on('disconnect', function () {
          console.log('disconnect Class!');
          location.reload();
        });
        console.log('isRoomJoined', isRoomJoined);
      }
    );
  }
  onWidgetLoaded();
});

//==============================================================================================

function SetTeacher() {
  let frame = GetWidgetFrame();
  document.getElementById("session-id").innerHTML = connection.extra.userFullName + " (" + params.sessionid + ")";
  $("#my-name").remove();
  $(".for_teacher").show();
  $(".controll").show();
  $(".feature").show();
  $(frame.document.getElementById("callteacher")).remove();
  $(frame.document.getElementById("homework")).remove();
}

function SetStudent() {
  GetMainVideo().style.display = 'block';
  document.getElementById("session-id").innerHTML = connection.extra.userFullName + " (" + params.sessionid + ")";
  $(".for_teacher").remove();
  $(".controll").remove();
  $(".feature").remove();
  $("#showcam").remove();
  $("#showcanvas").remove();

  let frame = GetWidgetFrame();
  $(frame.document.getElementById("3d_view")).remove();
  $(frame.document.getElementById("movie")).remove();
  $(frame.document.getElementById("file")).remove();
  $(frame.document.getElementById("epub")).remove();
}

function JoinStudent(event){
  document.getElementById("nos").innerHTML = connection.getAllParticipants().length;
  if (!connection.extra.roomOwner) return;
  var id = event.userid;
  var name = event.extra.userFullName;

  var img = document.createElement("img");
  if (!classroomInfoLocal.showcanvas)
    img.style.display = 'none';
  canvas_array[id] = img;
  console.log("JOIN ROOM", id, name);
  var div = $(' <span data-id="' + id + '" data-name="' + name + '" class="student">\
              <span style="display:none;" class="permissions"></span> \
              <span class="student-overlay"></span> \
              <span class="bor"></span> \
              <span class="name">' + name + '</span></span>')
  OnClickStudent(div, id, name);
  var interval;

  div[0].addEventListener("mouseover", function () {
    clearInterval(interval);
    Show("bigcanvas");
    document.getElementById("bigcanvas-img").src = canvas_array[id].src;
    interval = setInterval(function () {
      document.getElementById("bigcanvas-img").src = canvas_array[id].src;
    }, 1000);
  })

  div[0].addEventListener("mouseleave", function () {
    Hide("bigcanvas");
    clearInterval(interval);
  })

  $("#student_list").append(div);
  $(div).append(img);

}

function LeftStudent(event){
  document.getElementById("nos").innerHTML = connection.getAllParticipants().length;
  if (!connection.extra.roomOwner) {
    console.log("Teacher left class")
    return;
  }
  var id = event.userid;
  var name = event.extra.userFullName;

  if (id == classroomInfo.classPermission)
    classroomInfo.classPermission = undefined;

  if (id == classroomInfo.micPermission)
    classroomInfo.micPermission = undefined;

  if (permissionManager.IsCanvasPermission(id))
  permissionManager.DeleteCanvasPermission(id);

  
  var childern = document.getElementById("student_list").children;
  for (var i = 0; i < childern.length; i++) {
    var child = childern[i];
    if (child.dataset.id == id) {
      document.getElementById("student_list").removeChild(child);
      delete canvas_array[id];
      console.log("EXIT ROOM", id, name);
      break;
    }
  }
}


function ToggleViewType() {
  $('.view_type').click(function () {
    $('.view_type').removeClass('view_type-on');
    $(this).addClass('view_type-on');

    switch (this.id) {
      case 'top_student':
        var childern = document.getElementById("student_list").children;
        classroomInfoLocal.showcanvas = true;
        for (var i = 0; i < childern.length; i++) {
          Show(childern[i].getElementsByTagName("img")[0]);
          Hide(childern[i].getElementsByTagName("video")[0]);
        }
        $('#student_list').show();
        break;
      case 'top_camera':
        var childern = document.getElementById("student_list").children;
        classroomInfoLocal.showcanvas = false;
        for (var i = 0; i < childern.length; i++) {
          Show(childern[i].getElementsByTagName("video")[0]);
          Hide(childern[i].getElementsByTagName("img")[0]);
        }
        break;
    }
  });
}

function CallTeacher() {
  connection.send({callTeacher: { userid: connection.userid } }, GetOwnerId());
}

// Save classinfo on user exit
function saveClassInfo() {
  localStorage.setItem('sessionid', params.sessionid);
  localStorage.setItem('points', params.sessionid);
  localStorage.setItem('currentPage', currentPdfPage);
  localStorage.setItem('isSharingScreen', classroomInfo.shareScreen.state);
  localStorage.setItem('isSharing3D', isSharing3D);
  localStorage.setItem('isSharingMovie', isSharingMovie);
  localStorage.setItem('isSharingFile', isSharingFile);
  localStorage.setItem('isSharingEpub', isSharingEpub);
  localStorage.setItem('isFileViewer', isFileViewer);
}

function loadClassInfo() {
  localStorage.getItem('sessionid', params.sessionid);
  localStorage.getItem('isSharingScreen', classroomInfo.shareScreen.state);
  localStorage.getItem('isSharing3D', isSharing3D);
  localStorage.getItem('isSharingMovie', isSharingMovie);
  localStorage.getItem('isSharingFile', isSharingFile);
  localStorage.getItem('isSharingEpub', isSharingEpub);
  localStorage.getItem('isFileViewer', isFileViewer);
}

function removeClassInfo() {
  localStorage.removeItem('sessionid', params.sessionid);
  localStorage.removeItem('isSharingScreen', classroomInfo.shareScreen.state);
  localStorage.removeItem('isSharing3D', isSharing3D);
  localStorage.removeItem('isSharingMovie', isSharingMovie);
  localStorage.removeItem('isSharingFile', isSharingFile);
  localStorage.removeItem('isSharingEpub', isSharingEpub);
  localStorage.removeItem('isFileViewer', isFileViewer);
}

function WindowFocusChecker() {
  window.focus();

  function sendFocus(state) {
    if (!connection.extra.roomOwner) {
      connection.send({
        onFocus: {
          userid: connection.userid,
          focus: state
        }
      }, GetOwnerId());
    }
  }

  var checkInterval = undefined;
  function focusCheck(e) {
    if (e.type == "blur") {
      RemoveTooltip();

      checkInterval = setTimeout(function () {
        sendFocus(false);
      }, 100);
    }
    else if (e.type == "focus") {
      sendFocus(true);
      clearTimeout(checkInterval);
    }
  }

  $(GetWidgetFrame()).on("blur focus", focusCheck);
  $(window).on("blur focus", focusCheck);
}

function resizeend() {
  if (new Date() - rtime < delta) {
    setTimeout(resizeend, delta);
  } else {
    timeout = false;
    CanvasResize();
  }
}

function CanvasResize() {
  var frame = GetWidgetFrame();
  frame.window.resize();

  var canvas = frame.document.getElementById('main-canvas');
  var x = canvas.width;
  var y = canvas.height;
  var renderCanvas = frame.document.getElementById('renderCanvas');
  if (renderCanvas) {
    renderCanvas.style.left = "50px";
    renderCanvas.width = x;
    renderCanvas.height = y;
  }
  if (frame.document.getElementById("epub-viewer"))
    EpubPositionSetting()
}

document.getElementById("right-tab-collapse").addEventListener("click",function(){
  this.classList.toggle("off");
  
  if(this.classList.contains("off")){
    this.style.transform = "rotate(90deg)";
    $(".right-tab").animate({width : "0%"})
    $("#widget-container").animate({right : "0%"},
    function(){
      CanvasResize();
    })
  }
  else{
    this.style.transform = "rotate(-90deg)";
    $(".right-tab").animate({width : "17.7%"})
    $("#widget-container").animate({right : "17.7%"},
    function(){
      CanvasResize();
    })
  }
})

var showcam = false;
function CamOnOff(){
  if(!showcam){
    Show(GetMainVideo());
    $('#student_list').hide();
  }
  else{
    Hide(GetMainVideo());
    $('#student_list').show();
  }
  showcam = !showcam
}
