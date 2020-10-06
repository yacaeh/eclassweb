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
// var screenshareManager  = new ScreenShareManagerClass();
var newscreenshareManager  = new NewScreenShareManagerClass();
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
  'screen_share'      : newscreenshareManager.btn,
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

// newscreenshareManager.setFrameRate(1, 2);

connection.session = {
  audio: false,
  video: false,
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
  if (!isSync) {
    classroomCommand.joinRoom();
    isSync = true;
  }
  classroomManager.joinStudent(event);
};

// connection.onclose = connection.onerror = 
connection.onleave = function (event) {
  classroomManager.leftStudent(event);
};

// connection.onstream = function (event) {
//   console.log('onstream!', event);

//   if (classroomInfo.shareScreen.state &&
//     (classroomInfo.shareScreen.id == event.streamid)) {
//     screenshareManager.streamstart(event);
//   };

//   if (event.share)
//     return;

//   if (params.open === 'true') {
//     maincamManager.addStudentCam(event);
//   }
//   else {
//     if (event.type == "local" && event.stream.isVideo) {
//       event.mediaElement.pause();
//       event.stream.mute("audio");
//     }
//     else {
//       maincamManager.addTeacherCam(event);
//     }
//   }
// };

connection.onstreamended = function (event) {
  console.log('onstreameneded!', event);
  newscreenshareManager.onclose(event);
};

designer.appendTo(widgetContainer, function () {
  console.log('designer append');

  params.open === 'true' ? classroomManager.createRoom() :
                           classroomManager.joinRoom();
  onWidgetLoaded();
});

connection.onmessage = function (event) {
  if (debug)
    console.log(event);

  if (permissionManager.eventListener(event))
    return;

  if (newscreenshareManager.eventListener(event))
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

// New WebRTC Functions
const log = msg =>
  document.getElementById('logs').innerHTML += msg + '<br>'
  
const config = {
  iceServers: [{
    urls: [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302',
      'stun:stun.l.google.com:19302?transport=udp',
    ]
  }]
}
const wsuri = `wss://192.168.124.41:7000/ws`
const socket = new WebSocket(wsuri);
const pc = new RTCPeerConnection(config)

pc.ontrack = function ({ track, streams }) {
  console.log("New track added!");
  if (track.kind === "video") {
    track.onunmute = () => {
      if(params.open == 'false') maincamManager.addNewTeacherCam(streams[0]);
      else {
        if(connection.peers.getAllParticipants().length > 0)
          maincamManager.addNewStudentCam(connection.peers.getAllParticipants(),streams[0]);
        }
    }
  }
  console.log(classroomInfo.shareScreen.id);
  if (classroomInfo.shareScreen.state ) {
      newscreenshareManager.streamstart(streams[0]);
  };
  
}

pc.oniceconnectionstatechange = e => log(`ICE connection state: ${pc.iceConnectionState}`)
pc.onicecandidate = event => {
  if (event.candidate !== null) {
    socket.send(JSON.stringify({
      method: "trickle",
      params: {
        candidate: event.candidate,
      }
    }))
  }
}

socket.addEventListener('message', async (event) => {
  const resp = JSON.parse(event.data)

  // Listen for server renegotiation notifications
  if (!resp.id && resp.method === "offer") {
    log(`Got offer notification`)
    await pc.setRemoteDescription(resp.params)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    const id = connection.userid;
    log(`Sending answer`)
    socket.send(JSON.stringify({
      method: "answer",
      params: { desc: answer },
      id
    }))
  } else if (resp.method === "trickle") {
    pc.addIceCandidate(resp.params).catch(log);
  }
})

let join = async () => {
  console.log("Join to stream new video");
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  const id = connection.userid;
  console.log("params.sessionid:"+params.sessionid);
  console.log("connection.userid:"+connection.userid);
  socket.send(JSON.stringify({
    method: "join",
    params: { sid: params.sessionid, offer: pc.localDescription },
    id
  }))


  socket.addEventListener('message', (event) => {
    const resp = JSON.parse(event.data)
    if (resp.id === id) {
      log(`Got publish answer`)

      // Hook this here so it's not called before joining
      pc.onnegotiationneeded = async function () {
        log("Renegotiating")
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        const id = connection.userid;
        socket.send(JSON.stringify({
          method: "offer",
          params: { desc: offer },
          id
        }))

        socket.addEventListener('message', (event) => {
          const resp = JSON.parse(event.data)
          if (resp.id === id) {
            log(`Got renegotiation answer`)
            pc.setRemoteDescription(resp.result)
          }
        })
      }

      pc.setRemoteDescription(resp.result)
    }
  })
}

const VideoResolutions = {
  thumb: { width: { ideal: 82 }, height: { ideal: 58 } },
  qvga: { width: { ideal: 320 }, height: { ideal: 180 } },
  vga: { width: { ideal: 640 }, height: { ideal: 360 } },
  shd: { width: { ideal: 960 }, height: { ideal: 540 } },
  hd: { width: { ideal: 1280 }, height: { ideal: 720 } },
  fhd: { width: { ideal: 1920 }, height: { ideal: 1080 } },
  qhd: { width: { ideal: 2560 }, height: { ideal: 1440 } },
};

let resolutionOption = 'hd';
if (params.open === 'false') resolutionOption = 'thumb';

let options = {
  codec: 'VP9',
  resolution: resolutionOption,
  audio: true,
  video: true,
};

let localStream
let screenStream
navigator.mediaDevices.getUserMedia({
  video: options.video instanceof Object
  ? {
      ...VideoResolutions[options.resolution],
      ...options.video,
    }
  : options.video
  ? VideoResolutions[options.resolution]
  : false,
  audio: options.audio
}).then(stream => {
  localStream = stream
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });
  join()

}).catch(log)