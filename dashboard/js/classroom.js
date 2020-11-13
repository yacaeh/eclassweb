window.params = GetParamsFromURL();
ReactDOM.render(<App />, document.getElementById('app'));

//=============================================================================================

var debug = false;
var isSharing3D = false;
var isSharingMovie = false;
var isSharingFile = false;
var isSharingEpub = false;
let isFileViewer = false;

const topButtonContents = {};
const widgetContainer = document.getElementById("widget-container");
const rightTab        = document.getElementById("right-tab")

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

console.debug('Connection!');
connection.socketURL = '/';
connection.password = params.password;
connection.chunkSize = 64000;
connection.enableLogs = false;
connection.socketMessageEvent = 'home-class-socket';
connection.maxParticipantsAllowed = 100;
connection.extra.roomOwner = params.open == 'true';
connection.extra.userFullName = params.userFullName;
connection.publicRoomIdentifier = params.publicRoomIdentifier;
connection.session = {audio: false,video: false,data: true,screen: false,};
connection.sdpConstraints.mandatory = { OfferToReceiveAudio: false, OfferToReceiveVideo: false};

CheckLogin();

window.onWidgetLoaded = function () {
  console.debug("On widget loaded");
  pageNavigator.init();
  canvasManager.init();
  permissionManager.init();
  canvasManager.setCanvasButtons(canvasButtonContents);
  classroomManager.init(shortCut, topButtonContents);
  mobileHelper.init();
}

window.onSocketConnected = function () {
  updateClassTime();
  classroomCommand.updateSyncRoom();
  webRTCPCInit();
};

connection.onopen = function (event) {
  classroomManager.joinStudent(event);
};

connection.onclose = connection.onerror = connection.onleave = function (event) {
  classroomManager.leftStudent(event);
};

connection.onstreamended = function (event) {
  console.log('onstreameneded!', event);
  screenshareManager.onclose(event);
};

designer.appendTo(() => {
  console.debug('Designer append');
  connection.extra.roomOwner ? classroomManager.createRoom() :
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
    let moveURL = event.data.MoiveURL;
    isSharingMovie = moveURL.enable;
    OnMovieRender(moveURL.enable, moveURL.type, moveURL.url);
    return;
  }

  if (event.data.closeTesting) {
    if (!connection.extra.roomOwner) {
      $('#exam-board').hide(300);
    }
    rightTab.style.zIndex = 2;

    mobileHelper.isMobile ? 
      widgetContainer.style.right = "0px" : 
      widgetContainer.removeAttribute("style");
    return;
  }

  if (event.data.pageidx == pointer_saver.nowIdx) {
    designer.syncData(event.data);
  }

};