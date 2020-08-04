/////////////////////////////////////
// 스크린 공유, 스크린 저장 관련 //////
/////////////////////////////////////

// 스크린 저장 //////////////////////////////

class sc {
    RecordingStart() {
        var now = 0;
        var recordingTime = document.getElementById("recording-time");
        var text = recordingTime.getElementsByClassName("text")[0];

        document.getElementById("top_record_video").classList.add("on");
        document.getElementById("current-time").style.lineHeight = "18px";
        recordingTime.style.display = 'block';

        function timer() {
            now += 1;
            var time = now;
            var hour = Math.floor(time / 3600);
            time %= 3600;

            var min = Math.floor(time / 60);
            time %= 60;

            if (min < 10) min = '0' + min;

            if (time < 10) time = '0' + time;

            text.innerHTML = hour + ':' + min + ':' + time;
        }
        this.interval = setInterval(timer, 1000);
    }

    RecodingStop() {
        clearInterval(this.interval);
        document.getElementById("top_record_video").classList.remove("on");
        var recordingTime = document.getElementById("recording-time");
        var text = recordingTime.getElementsByClassName("text")[0];
        document.getElementById("current-time").style.lineHeight = "36px";
        recordingTime.style.display = 'none';
        text.innerHTML = '0:00:00';
    }
    constructor(){
      this.mergeAudioStreams = () => {
        const context = new AudioContext();
        const destination = context.createMediaStreamDestination();
        let hasDesktop = false;
        let hasVoice = false;
        if (this.desktopStream && this.desktopStream.getAudioTracks().length > 0) {
            // If you don't want to share Audio from the desktop it should still work with just the voice.
            const source1 = context.createMediaStreamSource(this.desktopStream);
            const desktopGain = context.createGain();
            desktopGain.gain.value = 0.7;
            source1.connect(desktopGain).connect(destination);
            hasDesktop = true;
        }

        if (this.voiceStream && this.voiceStream.getAudioTracks().length > 0) {
            const source2 = context.createMediaStreamSource(this.voiceStream);
            const voiceGain = context.createGain();
            voiceGain.gain.value = 0.7;
            source2.connect(voiceGain).connect(destination);
            hasVoice = true;
        }

        console.log(this.desktopStream)
        console.log(this.desktopStream.getAudioTracks())

        return (hasDesktop || hasVoice) ? destination.stream.getAudioTracks() : [];
    };
    }

   

    async _startCapturing() {
        this.start = true;

        this.desktopStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        this.voiceStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });

        const tracks = [
            ...this.desktopStream.getVideoTracks(),
            ...this.mergeAudioStreams()
        ];

        this.stream = new MediaStream(tracks);
        this.blobs = [];

        let options = {mimeType: 'video/webm;codecs=vp9,opus'};
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.error(`${options.mimeType} is not supported`);
          options = {mimeType: 'video/webm;codecs=vp8,opus'};
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.error(`${options.mimeType} is not supported`);
            options = {mimeType: 'video/webm'};
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
              console.error(`${options.mimeType} is not supported`);
              options = {mimeType: ''};
            }
          }
        }

        this.rec = new MediaRecorder(this.stream, options );

        this.rec.ondataavailable = (e) => this.blobs.push(e.data);
        this.rec.onstop = async () => {
            this.blob = new Blob(this.blobs, { type: 'video/webm' });
            let url = window.URL.createObjectURL(this.blob);
            this.RecodingStop()

            const downloadLink = document.querySelector('a#downloadLink');
            downloadLink.addEventListener('progress', e => console.log(e));
            downloadLink.href = url;
            downloadLink.download = this.makeName();
            downloadLink.click();
        };

        this.desktopStream.addEventListener('inactive', e => {
            if(e.type == "inactive"){
                this._stopCapturing();
            }
        });


        this.voiceStream.addEventListener('inactive', e => {
            if(e.type == "inactive"){
                this._stopCapturing();
            }
        });

        this.RecordingStart();
        this.rec.start(10);
    };

    _stopCapturing() {
        if(this.rec.state == "inactive"){
            return false;
        }
        this.rec.stop();
        this.desktopStream.getAudioTracks().forEach(s => s.stop());
        this.stream.getTracks().forEach(s => s.stop())
        this.stream = null;
    };

    makeName() {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hour = date.getHours();
        var min = date.getMinutes();
        var sec = date.getSeconds();
        var name = year + "년" + month + "월" + day + "일 " + hour + "시" + min + "분" + sec + "초" + '-수업녹화.webm';
        return name;
    }
}

var screen_recorder = new sc();

// 스크린 공유 //////////////////////////////

function ScreenShare(btn) {
  if (!classroomInfo.shareScreen.state && checkSharing()) {
    removeOnSelect(btn);
    return;
  }

  var on = $(btn).hasClass('on');
  console.log(on);

  if (!connection.extra.roomOwner && 
    connection.userid != classroomInfo.classPermission) {
    alert('화면 공유 권한이 없습니다');
    $(btn).removeClass("on selected-shape")
    return;
  }

  if (on) {
    isSharingScreen = false;
    if(typeof(lastStream) !== "undefined")
      lastStream.getTracks().forEach((track) => track.stop());
      btn.classList.remove("on");
    return false;
  }
  
  if(classroomInfo.shareScreen.state){
    alert("다른 사람이 화면 공유를 사용 중 입니다.")
    btn.classList.remove("on");
    $(btn).removeClass("on selected-shape")
    return;
  }

  screen_constraints = {
    screen: true,
    oneway: true,
  };

  if (navigator.mediaDevices.getDisplayMedia) {
    navigator.mediaDevices.getDisplayMedia(screen_constraints).then(
      (stream) => {
        btn.classList.toggle("selected-shape");
        btn.classList.toggle("on");


        isSharingScreen = true;
        lastStream = stream;
        replaceScreenTrack(stream, btn);
        CanvasResize();
      },
      (error) => {
        $(btn).removeClass('on');
        $(btn).removeClass('selected-shape');
      }
    );
  } else if (navigator.getDisplayMedia) {
    navigator.getDisplayMedia(screen_constraints).then(
      (stream) => {
        replaceScreenTrack(stream, btn);
      },
      (error) => {
        $(btn).removeClass('on');
        $(btn).removeClass('selected-shape');
      }
    );
  } else {
    alert('getDisplayMedia API is not available in this browser.');
  }
}

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
  ClearStudentCanvas();
  ClearTeacherCanvas();
  console.log("Stream Start", tempStream.streamid);
  classroomCommand.setShareScreenLocal({ state: true, id: tempStream.streamid });
  classroomInfoLocal.shareScreen.fromme = true;
  GetScreenSharingCanvas().srcObject = stream;

  if (connection.extra.roomOwner) {
    classroomInfo.shareScreen = {}
    classroomInfo.shareScreen.state = true
    classroomInfo.shareScreen.id = tempStream.streamid
  }

  classroomCommand.setShareScreenServer(true, result => {
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

function StreamingStart(stream, btn) {
  window.shareStream = stream;
  var screenTrackId = stream.getTracks()[0].id;

  addStreamStopListener(stream, function () {
    console.log("STOP SHARE")
    classroomCommand.StopScreenShare();
    classroomCommand.setShareScreenServer(false, () => {
      connection.send({ hideMainVideo: true });
      if (btn != undefined) {
        $(btn).removeClass("on");
        $(btn).removeClass("selected-shape");
      }
      window.sharedStream = null;
      hideScreenViewerUI();
      replaceTrack(tempStream.getTracks()[0], screenTrackId);
    });
  });
  ReTrack(stream);
  showScreenViewerUI();
}

function ReTrack(stream) {
  console.log("RE TRACK", stream.streamid);
  stream.getTracks().forEach(function (track) {
    if (track.kind === 'video' && track.readyState === 'live') {
      replaceTrack(track);
    }
  });
}

function SettingForScreenShare(){
  var tempStreamCanvas = document.createElement('canvas');
  var tempStream = tempStreamCanvas.captureStream();
  tempStream.isScreen = true;
  tempStream.streamid = tempStream.id;
  tempStream.type = 'local';
  connection.attachStreams.push(tempStream);
  window.tempStream = tempStream;
}

function GetStream(id) {
  try {
    return connection.streamEvents[id].stream;
  }
  catch{
    console.error("Can't find stream", id);
    console.log(connection.streamEvents)
    return undefined;
  }
}

function LoadScreenShare() {
  if (classroomInfo.shareScreen.state &&
    classroomInfo.shareScreen.id != undefined &&
    !classroomInfoLocal.shareScreen.fromme) {
    console.log("LOAD SCREEN")
    classroomCommand.openShare();
    CanvasResize();
  }
}

function showScreenViewerUI() {
  CanvasResize();
  GetScreenSharingCanvas().style.display = 'block';
}

function hideScreenViewerUI() {
  GetScreenSharingCanvas().style.display = 'none';
}