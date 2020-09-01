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

//=============================================================================================

var debug               = false;
var isSharing3D         = false;
var isSharingMovie      = false;
var isSharingFile       = false;
var isSharingEpub       = false;
let isFileViewer        = false;

const widgetContainer   = document.getElementById("widget-container");
const rightTab          = document.getElementById("right-tab")

var connection          = new RTCMultiConnection();
var screenRecorder      = new screenRecorderClass();
var screenshareManager  = new ScreenShareManagerClass();
var maincamManager      = new maincamManagerClass();
var canvasManager       = new canvasManagerClass();
var epubManager         = new epubManagerClass();
var mobileHelper        = new mobileHelperClass();
var pointer_saver       = new PointerSaver();
var classroomManager    = new classroomManagerClass();
var permissionManager   = new permissionManagerClass();
var attentionManager    = new attentionManagerClass();

//=============================================================================================

// 상단 버튼 도움말
const topButtonContents = {
  top_all_controll      : "전체 제어",
  top_test              : "시험",
  top_alert             : "알림",
  top_student           : "학생 판서",
  top_camera            : $.i18n( 'TOP_CAMERA' ),
  top_save_alert        : "알림 기록 저장",
  top_record_video      : "화면 녹화"
}

// 좌측 버튼 기능
const canvasButtonContents = {
  'screen_share': screenshareManager.btn,
  '3d_view'     : _3DCanvasOnOff,
  'movie'       : Movie_Render_Button,
  'file'        : LoadFile,
  'epub'        : epubManager.loadEpub,
  'callteacher' : classroomManager.callTeacher,
  'homework'    : HomeworkSubmit,
}

// Alt + 단축키
const shortCut = [
  {"onoff-icon"   : "a"},
  {"pencilIcon"   : "q"},
  {"markerIcon"   : "w"},
  {"eraserIcon"   : "e"},
  {"textIcon"     : "r"},
  {"undo"         : "z"},
  {"clearCanvas"  : "x"},
  {"screen_share" : "1"},
  {"3d_view"      : "2"},
  {"movie"        : "3"},
  {"file"         : "4"},
  {"epub"         : "5"},
  {"callteacher"  : "2"},
  {"homework"     : "3"},
]

//=============================================================================================

console.log('Connection!');
connection.socketURL = '/';
connection.chunkSize              = 16000;
connection.enableFileSharing      = false;
connection.socketMessageEvent     = 'canvas-dashboard-demo';
connection.extra.userFullName     = params.userFullName;
connection.publicRoomIdentifier   = params.publicRoomIdentifier;
connection.autoCloseEntireSession = false;
connection.maxParticipantsAllowed = 40;
connection.password               = params.password;
connection.enableLogs             = false;

screenshareManager.setFrameRate(1,2);

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

ChattingManager.init();

window.onWidgetLoaded = function () {
  examObj.init();
  pageNavigator.init();
  canvasManager.init();
  permissionManager.init();
  canvasManager.setCanvasButtons(canvasButtonContents);
  classroomManager.init(shortCut, topButtonContents);
  mobileHelper.init();
}

let isSync = false;

connection.onopen = function (event) {
  if(!isSync){
    classroomCommand.joinRoom();
    isSync = true;
  }
  classroomManager.joinStudent(event);
};

connection.onclose = connection.onerror = connection.onleave = function (event) {
  classroomManager.leftStudent(event);  
};

connection.onstream = function (event) {
  console.log('onstream!',event);

  if(classroomInfoLocal.shareScreen.state && (classroomInfo.shareScreen.id == event.streamid)){
    screenshareManager.streamstart(event);
  };


  if(event.share)
    return;

  if (params.open === 'true' || params.open === true) {
    maincamManager.addStudentCam(event);
  }
  else{
    if(event.type == "local" && event.stream.isVideo){
      event.mediaElement.pause();
      event.stream.mute("audio");
    }
    else{
      maincamManager.addTeacherCam(event);
    }
  }
};

connection.onstreamended = function (event) {
  console.warn('onstreameneded!',event);
  screenshareManager.onclose(event);
};

designer.appendTo(widgetContainer, function () {
  console.log('designer append');

  if (params.open === true || params.open === 'true') 
    classroomManager.createRoom();
  else 
    classroomManager.joinRoom();
  onWidgetLoaded();
});

connection.onmessage = function (event) {
  if (debug)
    console.log(event);

  if(permissionManager.eventListener(event))
    return;

  if(screenshareManager.eventListener(event))
    return;

  if(maincamManager.eventListener(event))
    return;

  if(ChattingManager.eventListener(event))
    return;

  if(canvasManager.eventListener(event))
    return;

  if(classroomManager.eventListener(event))
    return;

  if (event.data === 'plz-sync-points') {
    designer.sync();
    return;
  }

  if (event.data.roomInfo) {
    classroomCommand.onReceiveRoomInfo(event.data);
    console.debug("Synced class room info");
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
      attentionManager.submit({ userid: event.data.alertResponse.userid, name: event.data.alertResponse.name, response: event.data.alertResponse.response });
    return;
  }

  if (event.data.getpointer) {
    pointer_saver.send(event.data.idx);
    return;
  }

  if (event.data.setpointer) {
    if (event.data.idx == "empty")
      return;

    event.data.data.command = "load";

    if (event.extra.roomOwner && !connection.extra.roomOwner) {
      if (pointer_saver.nowIdx == event.data.idx) 
        designer.syncData(event.data.data);
    }
    else {
      event.data.data.isStudent = true;
      if (pointer_saver.nowIdx == event.data.idx) 
        designer.syncData(event.data.data);
    }
    return;
  }

  if (event.data.exam) {
    examObj.receiveExamData(event.data.exam);
    return;
  }

  if (event.data.viewer) {
    if (event.data.viewer.cmd == "close") {
      pageNavigator.off();
      canvasManager.clear();
    }

    if(!(event.data.viewer.cmd == "pause" || event.data.viewer.cmd == "play")){
      canvasManager.clear();
    }

    classroomCommand.updateViewer(event.data.viewer);
    return;
  }

  if (event.data.epub) {
    classroomCommand.receiveEpubMessage(event.data.epub);
    return;
  }

  if (event.data.modelEnable) {
    canvasManager.clear();

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


  if (event.data.closeTesting) {
    if (!connection.extra.roomOwner) {
      $('#exam-board').hide(300);
      rightTab.style.zIndex = 3;
    }

    mobileHelper.isMobile ? widgetContainer.style.right = "0px" : widgetContainer.removeAttribute("style");
    return;
  }

  if (event.data.pageidx == pointer_saver.nowIdx) {
    designer.syncData(event.data);
  }
};