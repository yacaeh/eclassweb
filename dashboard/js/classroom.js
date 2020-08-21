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

const uploadServerUrl = "https://files.primom.co.kr:1443";

//=============================================================================================

var debug               = false;
var isSharing3D         = false;
var isSharingMovie      = false;
var isSharingFile       = false;
var isSharingEpub       = false;
let isFileViewer        = false;

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

screenshareManager.setFrameRate(5,10);

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

window.onWidgetLoaded = function () {
  examObj.init();
  mobileHelper.init();
  pageNavigator.init();
  canvasManager.init();
  ChattingManager.init();
  permissionManager.init();
  canvasManager.setCanvasButtons(canvasButtonContents);
  classroomManager.init(shortCut, topButtonContents);
}

connection.onopen = function (event) {
  console.log('onopen!', event.extra.userFullName, event.userid);
  classroomManager.joinStudent(event);
};

connection.onclose = connection.onerror = connection.onleave = function (event) {
  console.log('onclose!');
  classroomManager.leftStudent(event);
};

connection.onstream = function (event) {
  console.log('onstream!',event);
  if(event.share)
    return;

  if (params.open === 'true' || params.open === true) {
    permissionManager.mute();
    maincamManager.addStudentCam(event);
  }
  else{
    maincamManager.addTeacherCam(event);
  }
};

connection.onstreamended = function (event) {
  console.log('onstreameneded!',event);
  screenshareManager.onclose(event);
};

designer.appendTo(document.getElementById('widget-container'), function () {
  console.log('designer append');

  if (params.open === true || params.open === 'true') {
    console.log('Opening Class!');
    classroomManager.setTeacher();
    connection.extra.roomOwner = true;
    connection.open(params.sessionid, function (isRoomOpened, roomid, error) {
      if (!isRoomOpened) {
        alert("이미 존재하는 방입니다.");
        var href = location.protocol + "//" + location.host + "/dashboard/";
        window.open(href, "_self");
      }
      else {
        if (error) {
          connection.rejoin(params.sessionid);
        }
        classroomCommand.joinRoom();
        connection.socket.on('disconnect', function () {
          location.reload();
        });
      }
    });
  }
  //----------------------------------------------------------------
  else {
    classroomManager.setStudent();

    console.log('try joining!');
    connection.DetectRTC.load(function () {
    });

    connection.join({
        sessionid: params.sessionid,
        userid: connection.channel,
        session: connection.session
      }, function (isRoomJoined, roomid, error) {
        console.log('Joing Class!');

        if (error) {
          console.log('Joing Error!');
          if (error === connection.errors.ROOM_NOT_AVAILABLE) {
            // alert("방이 존재하지 않습니다.");
            location.reload();
            return;
          }
          if (error === connection.errors.ROOM_FULL) {
            alert("방이 가득 찼습니다.");
            classroomManager.gotoMain();
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


  if (event.data.roomSync) {
    classroomCommand.receiveSyncRoomInfo(event.data.roomSync);
    console.log(classroomInfo)
    return;
  }

  if (event.data === 'plz-sync-points') {
    console.log("Sync! when connect ! with" ,event.userid);
    designer.sync();
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
      if (pointer_saver.nowIdx == event.data.idx) {
        designer.syncData(event.data.data);
      }
    }
    else {
      event.data.data.isStudent = true;
      if (pointer_saver.nowIdx == event.data.idx) {
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
      $(".right-tab").css("z-index", 3);
    }

    if (mobileHelper.isMobile)
      document.getElementById("widget-container").style.right = "0px";
    else
      document.getElementById("widget-container").removeAttribute("style")
    return;
  }

  if (event.data.pageidx == pointer_saver.nowIdx) {
    designer.syncData(event.data);
  }
};