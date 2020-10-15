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
  if(!window.params.bylogin)
    window.params.bylogin = 'false';

  console.log(window.params);
})();

//=============================================================================================

var debug = false;
var isSharing3D = false;
var isSharingMovie = false;
var isSharingFile = false;
var isSharingEpub = false;

let remainCams = {};
let isFileViewer = false;

const widgetContainer = document.getElementById("widget-container");
const rightTab = document.getElementById("right-tab")

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
  top_camera            : "학생 카메라",
  top_save_alert        : "알림 기록 저장",
  top_record_video      : "화면 녹화",
  student_isallcontrol  : "선생님이 전체 제어 중 입니다",
  student_screenshare   : "화면 공유 권한을 획득한 상태입니다",
  student_canvas        : "나의 판서를 공유 중 입니다.",
  student_mic           : "마이크 권한을 획득한 상태입니다"
}

// 좌측 버튼 기능
const canvasButtonContents = {
  'screen_share'      : screenshareManager.btn,
  '3d_view'           : _3DCanvasOnOff,
  'movie'             : Movie_Render_Button,
  'file'              : LoadFile,
  'epub'              : epubManager.loadEpub,
  'callteacher'       : classroomManager.callTeacher,
  'homework'          : HomeworkSubmit,
}

// Alt + 단축키
const shortCut = [
  { "onoff-icon": "a" },
  { "pencilIcon": "q" },
  { "markerIcon": "w" },
  { "eraserIcon": "e" },
  { "textIcon": "r" },
  { "undo": "z" },
  { "clearCanvas": "x" },
  { "screen_share": "1" },
  { "3d_view": "2" },
  { "movie": "3" },
  { "file": "4" },
  { "epub": "5" },
  { "callteacher": "2" },
  { "homework": "3" },
]

//=============================================================================================

console.log('Connection!');
connection.socketURL = '/';
connection.password = params.password;
connection.chunkSize = 64000;
connection.enableLogs = false;
connection.socketMessageEvent = 'canvas-dashboard-demo';
connection.extra.userFullName = params.userFullName;
connection.publicRoomIdentifier = params.publicRoomIdentifier;
connection.maxParticipantsAllowed = 40;

if(params.uid)
  connection.userid = params.uid;

if(window.params.bylogin === "true"){
  // logincheck();
}

async function logincheck(){
  const info = await PostAsync("/get-now-account", {});
  if(info.code == 400){
    alert("로그인 정보가 없습니다.");
  }else{
  }
}

screenshareManager.setFrameRate(1, 2);

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
  console.debug("On widget loaded");
  examObj.init();
  pageNavigator.init();
  canvasManager.init();
  permissionManager.init();
  canvasManager.setCanvasButtons(canvasButtonContents);
  classroomManager.init(shortCut, topButtonContents);
  mobileHelper.init();
}

window.onClassroominfoChanged = function(prop, value) {
  console.log("ClassroomInfo changed",prop,' = ',value);
}

let isSync = false;

connection.onopen = function (event) {
  console.log('on open', event);
  classroomManager.joinStudent(event);
};

// connection.onclose = connection.onerror = 
connection.onleave = function (event) {
  classroomManager.leftStudent(event);
};

connection.onstream = function (event) {
  console.log('onstream!', event);

  if (classroomInfo.shareScreen &&
    classroomInfo.shareScreen.state &&
    (classroomInfo.shareScreen.id == event.streamid)) {
    screenshareManager.streamstart(event);
  };

  if (event.share)
    return;

  if (params.open === 'true') {
    maincamManager.addStudentCam(event);
  }
  else {
    if (event.type == "local" && event.stream.isVideo) {
      event.mediaElement.pause();
      event.stream.mute("audio");
    }
    else {
      maincamManager.addTeacherCam(event);
    }
  }
};

connection.onstreamended = function (event) {
  console.log('onstreameneded!', event);
  screenshareManager.onclose(event);
};

designer.appendTo(widgetContainer, function () {
  console.log('designer append');

  params.open === 'true'? 
                           classroomManager.createRoom() :
                           classroomManager.joinRoom();
  onWidgetLoaded();
});

connection.onmessage = function (event) {
  if (debug)
    console.log(event);

  if (permissionManager.eventListener(event))
    return;

  if (screenshareManager.eventListener(event))
    return;

  if (maincamManager.eventListener(event))
    return;

  if (ChattingManager.eventListener(event))
    return;

  if (canvasManager.eventListener(event))
    return;

  if (classroomManager.eventListener(event))
    return;

  if (event.data === 'plz-sync-points') {
    designer.sync();
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
      attentionManager.submit({
        userid: event.data.alertResponse.userid,
        name: event.data.alertResponse.name,
        response: event.data.alertResponse.response
      });
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

    if (!(event.data.viewer.cmd == "pause" || event.data.viewer.cmd == "play")) {
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
    setShared3DStateLocal(event.data.modelEnable.enable);
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
    let moveURL = event.data.MoiveURL;
    OnMovieRender(moveURL.enable, moveURL.type, moveURL.url);
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

function showstatus() {
  connection.socket.emit("show-class-status",
    (rooms) => {
      console.log(rooms)
    })
}

