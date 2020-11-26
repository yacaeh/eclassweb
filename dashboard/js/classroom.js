window.params = GetParamsFromURL();


const render = () => {
  ReactDOM.render(
      <App />,
    document.getElementById('app'));
}
store.subscribe(render);
render();

//=============================================================================================

var debug = false;
var isSharing3D = false;
var isSharingMovie = false;
var isSharingFile = false;

var connection = new RTCMultiConnection();
var epubManager = new epubManagerClass();
var screenshareManager = new ScreenShareManagerClass();
var maincamManager = new maincamManagerClass();
var canvasManager = new canvasManagerClass();
var mobileHelper = new mobileHelperClass();
var pointer_saver = new PointerSaver();
var classroomManager = new classroomManagerClass();
var permissionManager = new permissionManagerClass();
var attentionManager = new attentionManagerClass();

//=============================================================================================

const widgetContainer = document.getElementById("widget-container");
const rightTab = document.getElementById("right-tab")

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
connection.session = { audio: false, video: false, data: true, screen: false, };
connection.sdpConstraints.mandatory = { OfferToReceiveAudio: false, OfferToReceiveVideo: false };

window.onWidgetLoaded = function () {
  console.debug("On widget loaded");
  pageNavigator.init();
  canvasManager.init();
  permissionManager.init();
  classroomManager.init(shortCut);
  mobileHelper.init();
}

window.onSocketConnected = function () {
  classroomCommand.updateSyncRoom();
  webRTCPCInit();
  document.body.removeChild(document.getElementById("loading-screen"));
};

connection.onopen = event => reactEvent.joinStudent(event);
connection.onclose = connection.onerror = connection.onleave = event => reactEvent.leftStudent(event);

designer.appendTo(() => {
  console.debug('Designer append');
  connection.extra.roomOwner ? classroomManager.createRoom() :
                               classroomManager.joinRoom();
  onWidgetLoaded();
});

connection.onmessage = function (event) {
  if (debug)
    console.log(event);

  if (permissionManager.eventListener(event) ||
    screenshareManager.eventListener(event) ||
    canvasManager.eventListener(event) ||
    classroomManager.eventListener(event)
  )
    return;

  if (event.data === 'plz-sync-points') {
    designer.sync();
    return;
  }

  if (event.data.chatMessage) {
    reactEvent.chatting(event);
    return true;
  }

  if (event.data.allControl) {

    if (event.data.allControl.state) {
      classroomInfo = event.data.allControl.roomInfo;
      store.dispatch({ type: SET_CLASSROOM_INFO, data: event.data.allControl.roomInfo });
    }
    else {
      classroomInfo.allControl = false;
      store.dispatch({ type: SET_CLASSROOM_INFO, data: { ...classroomInfo, allControl: false } });
    }

    classroomCommand.updateSyncRoom();
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

    mfileViewer.updateViewer(event.data.viewer);
    return;
  }

  if (event.data.epub) {
    console.log(event.data);

    let data = event.data.epub
    if (data.cmd) {
      classroomCommand.updateEpubCmd(data);
    } else {
      let currentState = classroomInfo.epub.state;
      if (currentState != data.state) {
        classroomInfo.epub = data;
        classroomInfo.epub.state ? classroomCommand.openEpub(event.data.url) : epubManager.unloadEpubViewer();
      }
    }

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

    store.getState().isMobile ?
      widgetContainer.style.right = "0px" :
      widgetContainer.removeAttribute("style");
    return;
  }

  if (event.data.pageidx == pointer_saver.nowIdx) {
    designer.syncData(event.data);
  }
  
};