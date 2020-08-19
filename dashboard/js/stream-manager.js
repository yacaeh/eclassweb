/////////////////////////////////////
// 스크린 공유, 스크린 저장 관련 //////
/////////////////////////////////////

// 스크린 저장 //////////////////////////////

class ScreenRecorderClass {
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
  constructor() {
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

    let options = { mimeType: 'video/webm;codecs=vp9,opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not supported`);
      options = { mimeType: 'video/webm;codecs=vp8,opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not supported`);
        options = { mimeType: 'video/webm' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.error(`${options.mimeType} is not supported`);
          options = { mimeType: '' };
        }
      }
    }

    this.rec = new MediaRecorder(this.stream, options);

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
      if (e.type == "inactive") {
        this._stopCapturing();
      }
    });


    this.voiceStream.addEventListener('inactive', e => {
      if (e.type == "inactive") {
        this._stopCapturing();
      }
    });

    this.RecordingStart();
    this.rec.start(10);
  };

  _stopCapturing() {
    if (this.rec.state == "inactive") {
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

class ScreenShareManagerClass{
  constructor(){
    this.isScreenShare = false;
    this.lastStream = undefined;
    this.self = this;
  }

  init() {
  }
  get() {
    return GetWidgetFrame().document.getElementById("screen-viewer");
  }
  show() {
    CanvasResize();
    this.get().style.display = 'block';
  }
  hide() {
    this.get().style.display = 'none';
  }
  srcObject(src) {
    if (src)
      this.get().srcObject = src;
    else
      return this.get().srcObject;
  }
  start(stream, btn) {
    connection.send({
      showScreenShare: stream.id,
    });

    window.shareStream = stream;
    var screenTrackId = stream.getTracks()[0].id
    ScreenshareManager.show();
  }
  stop() {
    console.log("Stop screen sharing")
    this.hide();
    classroomInfo.shareScreen = {};
    classroomInfo.shareScreen.state = false
    classroomInfo.shareScreen.id = undefined
    classroomInfo.shareScreen.stream = undefined
    classroomInfoLocal.shareScreen.state = false;
    classroomInfoLocal.shareScreen.id = false;
  }
  btn(btn) {
    if (!classroomInfo.shareScreen.state && checkSharing()) {
      removeOnSelect(btn);
      return;
    }

    var on = btn.classList.contains("on");
    if (!connection.extra.roomOwner &&
      connection.userid != classroomInfo.classPermission) {
      alert('화면 공유 권한이 없습니다');
      btn.classList.remove("on");
      btn.classList.remove("selected-shape");
      return;
    }

    if (on) {
      this.isSharingScreen = false;

      if (typeof (this.lastStream) !== "undefined")
        this.lastStream.getTracks().forEach((track) => track.stop());

      btn.classList.remove("on");
      return false;
    }

    if (classroomInfo.shareScreen.state) {
      alert("다른 사람이 화면 공유를 사용 중 입니다.")
      btn.classList.remove("on");
      btn.classList.remove("selected-shape");
      return;
    }

    // screen_constraints = {
    //   screen: true,
    //   oneway: true,
    // };

    var screen_constraints = {
      audio: true, // or true
      oneway : true,
      video: {
        mandatory: {
          // maxWidth : 1280,
          // maxHeight : 720,
          maxFrameRate : 12,
        }
      }
    }


    if (navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia(screen_constraints).then(
        (stream) => {
          btn.classList.toggle("selected-shape");
          btn.classList.toggle("on");

          stream.isScreenShare = true;
          connection.addStream(stream)
          ScreenshareManager.get().volume = 0;
          // connection.attachStreams.push(stream);

          addStreamStopListener(stream, function () {
            ScreenshareManager.stop();            
            connection.removeStream(stream.id)
            connection.attachStreams.forEach(function (e) {
              if(e.id == stream.id){
                var idx = connection.attachStreams.indexOf(e);
                connection.attachStreams.splice(idx,1);
              }
            })


            classroomCommand.setShareScreenServer(false, () => {
              connection.send({ hideScreenShare: true });
              if (btn != undefined) {
                btn.classList.remove("on");
                btn.classList.remove("selected-shape")
              }
              ScreenshareManager.hide();

            });
          })

          this.isSharingScreen = true;
          this.lastStream = stream;
          replaceScreenTrack(stream, btn);
          CanvasResize();
        },
        (error) => {
          btn.classList.remove("on");
          btn.classList.remove("selected-shape");
        }
      );
    } else if (navigator.getDisplayMedia) {
      navigator.getDisplayMedia(screen_constraints).then(
        (stream) => {
          replaceScreenTrack(stream, btn);
        },
        (error) => {
          btn.classList.remove("on");
          btn.classList.remove("selected-shape");
        }
      );
    } else {
      alert('getDisplayMedia API is not available in this browser.');
    }
  }
  eventListener(event) {
    if (event.data.showScreenShare) {
      console.log("SCREEN SHARE START", event.data.showScreenShare)

      CanvasManager.clear();
      classroomInfoLocal.shareScreenByStudent = true;
      classroomInfoLocal.shareScreen.state = true;
      classroomInfo.shareScreen = {}
      classroomInfo.shareScreen.state = true;
      classroomInfo.shareScreen.id = event.data.showScreenShare;
      classroomInfo.shareScreen.userid = event.userid;

      let inter = setInterval(function(){
        try{
          var stream = connection.streamEvents[event.data.showScreenShare].stream;
          var parent =  ScreenshareManager.get().parentElement;
          console.log(parent);

          parent.removeChild(ScreenshareManager.get());
          let element = connection.streamEvents[event.data.showScreenShare].mediaElement;
          element.id = "screen-viewer";
          element.volume = 0.3;
          parent.appendChild(element);
          ScreenshareManager.show();
          ScreenshareManager.srcObject(stream);
          clearInterval(inter);
        }
        catch(error){
        }
      },500);

      return true;
    }

    if (event.data.hideScreenShare) {
      console.log("SCREEN SHARE STOPED", event.userid)
      console.log(event)
      classroomInfoLocal.shareScreenByStudent = false;
      ScreenshareManager.hide();
      classroomCommand.setShareScreenLocal({ state: false, id: undefined });
      return true;
    }

    if (event.data.studentStreaming) {
      console.log("Student Start Streaming");
      ScreenshareManager.start(event.data.studentStreaming)
      return true;
    }
  }
  rejoin() {
    let interval = setInterval(function () {
      try {
        console.log(event);
        var parent = ScreenshareManager.get().parentElement;
        let element = connection.streamEvents[classroomInfo.shareScreen.id].mediaElement;
        element.id = "screen-viewer";
        parent.removeChild(ScreenshareManager.get());
        parent.appendChild(element);
        element.volume = 0.3
        ScreenshareManager.show();
        CanvasResize();
        clearInterval(interval);
      }
      catch(error){
        console.error(error)
      }
    }, 500);
  }
  onclose(event) {
    if (connection.extra.roomOwner && classroomInfo.shareScreen.id == event.streamid) {
      console.error("Streamer exit");
      this.stop();
      event.stream.getTracks().forEach((track) => track.stop());
      connection.send({ hideScreenShare: true });
      classroomCommand.setShareScreenServer(false, () => { console.log("Streaming Finish") });
    }
  }
}

class MaincamManagerClass{
  get() {
    var video = document.getElementById("main-video");
    if (video) {
      return video;
    }
    else {
      return GetWidgetFrame().document.getElementById("main-video");
    }
  }
  show() {
    Show(this.get());
  }
  hide() {
    Hide(this.get());
  }
  start(callback) {
    var inter = setInterval(function () {
      if (MaincamManager.get().readyState == 4) {
        MaincamManager.show();
        MaincamManager.get().muted = true;
        MaincamManager.get().play();
        clearInterval(inter);
        if (callback)
          callback();
      }
    }, 200)
  }
  srcObject(src) {
    if (src) {
      this.get().srcObject = src;
      this.get().setAttribute('data-streamid', src.id)
    }
    else {
      return this.get().srcObject;
    }
  }
  addStudentCam(event) {
    if(!event.stream.isVideo) 
      return;
    try {
      event.mediaElement.controls = false;
      event.mediaElement.style.width = "100%";
      event.mediaElement.style.height = "100%";
      event.mediaElement.style.pointerEvents = "none";
      event.mediaElement.style.position = "absolute";

      if (classroomInfo.showcanvas) {
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
  addTeacherCam (event){
    if (!event.extra.roomOwner || !event.stream.isVideo)
      return;
      var video = this.get();
      if (event.type === 'local') 
      video.volume = 0;
      this.srcObject(event.stream);
      console.log("MAIN CHANGED",event);
    this.start();
    
  }
  eventListener(event) {
  }
}

var ScreenRecorder      = new ScreenRecorderClass();
var ScreenshareManager  = new ScreenShareManagerClass();
var MaincamManager      = new MaincamManagerClass();

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

function replaceScreenTrack(stream, btn) {
  CanvasManager.clearCanvas();
  CanvasManager.clearStudentCanvas();
  CanvasManager.clearTeacherCanvas();
  
  console.log("Stream Start", stream.id);

  classroomCommand.setShareScreenLocal({
    state: true,
    id: stream.id,
  });

  classroomInfoLocal.shareScreen.fromme = true;
  ScreenshareManager.srcObject(stream);

  if (connection.extra.roomOwner) {
    classroomInfo.shareScreen = {}
    classroomInfo.shareScreen.state = true
    classroomInfo.shareScreen.id = stream.id
  }

  classroomCommand.setShareScreenServer(true, result => {
    ScreenshareManager.start(stream, btn);
  });
}