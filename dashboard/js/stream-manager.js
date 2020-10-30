/////////////////////////////////////
// 스크린 공유, 스크린 저장 관련 //////
/////////////////////////////////////

// 스크린 저장 //////////////////////////////

class screenRecorderClass {
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
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    return year + "/" + month + "/" + day + "/ " + hour + "/" + min + "/" + sec + '-' + $.i18n('RECORD') + '.webm';
  }
}

class NewScreenShareManagerClass {
  constructor() {
    this.isScreenShare = false;
    this.lastStream = undefined;
    this.self = this;
    this.senders = [];
    this.sender = undefined;

    // this.minFrameRate = 5
    // this.maxFrameRate = 10;
  }

  // setFrameRate(min,max) {
  //   this.minFrameRate = min;
  //   this.maxFrameRate = max;
  // };

  get() {
    return GetWidgetFrame().document.getElementById("screen-viewer");
  }
  show() {
    console.log("Show!");
    classroomManager.canvasResize();
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
    connection.send({ showScreenShare: stream.id });
    window.shareStream = stream;
    newscreenshareManager.show();
  }
  stop() {
    console.log("Stop screen sharing")
    this.hide();
    classroomInfo.shareScreen = {
      state: false,
      id: undefined,
      userid: undefined
    };
    classroomManager.updateClassroomInfo((result) => console.log(result));
  }
  btn(btn) {
    if (!classroomInfo.shareScreen.state && checkSharing()) {
      removeOnSelect(btn);
      return;
    }

    var on = btn.classList.contains("on");
    if (!connection.extra.roomOwner &&
      connection.userid != classroomInfo.classPermission) {
      alert($.i18n('NO_SCREEN_PERMISSION'));
      btn.classList.remove("on");
      btn.classList.remove("selected-shape");
      return;
    }

    if (on) {
      newscreenshareManager.isSharingScreen = false;

      if (typeof (newscreenshareManager.lastStream) !== "undefined")
      console.log("SCreenshare stop on ");
      newscreenshareManager.lastStream.getTracks().forEach((track) => track.stop());
      btn.classList.remove("on");
      return false;
    }

    if (classroomInfo.shareScreen.state) {
      alert($.i18n('SOMEONE_USING_SCREEN'));
      btn.classList.remove("on");
      btn.classList.remove("selected-shape");
      return;
    }

    let options = {
      codec: 'VP9',
      resolution: 'fhd',
      audio: true,
      video: true,
    };

    var screen_constraints = {
      audio: true, // or true
      oneway: true,
      video: options.video instanceof Object
        ? {
          ...VideoResolutions[options.resolution],
          ...options.video,
        }
        : options.video
          ? VideoResolutions[options.resolution]
          : false,
    }
  
    if (navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia(screen_constraints).then(
        (stream) => {
          btn.classList.toggle("selected-shape");
          btn.classList.toggle("on");
          stream.isScreenShare = true;
          screenStream = stream;
          newscreenshareManager.get().volume = 0;
          newscreenshareManager.isSharingScreen = true;
          newscreenshareManager.lastStream = stream;

          let track = stream.getVideoTracks()[0];
          this.sender = pc.addTrack(track, stream);

          track.onended = () => { // Click on browser UI stop sharing button
            console.info("Sharing has ended");
            newscreenshareManager.onclose();
            pc.removeTrack(this.sender);
            this.sender = undefined;
          };
          
          // pc.getSenders()[2].replaceTrack(newscreenshareManager.lastStream.getVideoTracks()[0]);

          replaceScreenTrack(stream, btn);
          addStreamStopListener(stream, function () {
            console.log("Stream stop listner stop");

            stream.getTracks().forEach(function (track) {
              console.log("REMOVE TRACK --- ", track)
              pc.getSenders().forEach((sender) => {
                if (sender.track && sender.track.id == track.id) {
                  pc.removeTrack(sender);
                }
              })

              track.stop();
              stream.removeTrack(track);
            })

            connection.send({ hideScreenShare: true });

            if (btn != undefined) {
              btn.classList.remove("on");
              btn.classList.remove("selected-shape")
            }
            newscreenshareManager.hide();

          })
        },
        (error) => {
          btn.classList.remove("on");
          btn.classList.remove("selected-shape");
        },
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
          callback();
          callback = function () { };
        },
        false
      );

    }

    function replaceScreenTrack(stream, btn) {
      canvasManager.clear();
      console.log("Stream Start", stream.id);
      newscreenshareManager.srcObject(stream);
      classroomInfo.shareScreen = {
        state: true,
        id: stream.id,
        userid: connection.userid
      };
      classroomManager.updateClassroomInfo((result) => console.log(result));
      newscreenshareManager.start(stream, btn);
    }
  }
  streamstart(stream) {
    console.info("Stream start!");
    this.srcObject(stream);
    this.show();

    // let parent = this.get().parentElement;
    // parent.removeChild(this.get());

    // let el = document.createElement("video")
    // el.srcObject = stream; 
    // el.setAttribute('id', "screen-viewer"); 
    // el.controls = true;
    // el.volume = 0.3;
    // element.controls = false;

    // parent.appendChild(el);
    // el.muted = true;

    // var playPromise = el.play();

    // if (playPromise !== undefined) {
    //   playPromise.then(_ => {
    //     // Automatic playback started!
    //     // Show playing UI.
    //     // We can now safely pause video...
    //     el.play();
    //   })
    //   .catch(error => {
    //     // Auto-play was prevented
    //     // Show paused UI.
    //   });
    // }

  }

  eventListener(event) {
    if (event.data.showScreenShare) {
      console.debug("Start Screensharing", event.data.showScreenShare)
      canvasManager.clear();
      classroomInfo.shareScreen = {
        state: true,
        id: event.data.showScreenShare,
        userid: event.userid
      }
      return true;
    }

    if (event.data.hideScreenShare) {
      console.log("SCREEN SHARE STOPED", event.userid)
      newscreenshareManager.hide();
      classroomInfo.shareScreen = {
        state: false,
        id: undefined,
        userid: undefined
      }
      return true;
    }

    if (event.data.studentStreaming) {
      console.log("Student Start Streaming");
      newscreenshareManager.start(event.data.studentStreaming)
      return true;
    }
  }
  // rejoin() {
  //   console.log(classroomInfo.shareScreen.id);
  //   let interval = setInterval(function () {
  //     try {
  //       let stream = pc.getReceivers();

  //       console.log(stream);
  //       console.log("classroomInfo.shareScreen.id",classroomInfo.shareScreen.id)
  //       newscreenshareManager.streamstart(stream);
  //       clearInterval(interval);
  //     }
  //     catch(error){
  //       console.error(error)
  //     }
  //   }, 500);
  // }
  onclose() {
    if (classroomInfo.shareScreen.id) {
      console.error("Streamer exit");
      this.stop();
      console.log("onclose stop");
      connection.send({ hideScreenShare: true });
    }
  }

}
class maincamManagerClass {
  get() {
    let video = document.getElementById("main-video");
    return video ? video : GetWidgetFrame().document.getElementById("main-video");
  }
  show() {
    Show(this.get());
  }
  hide() {
    Hide(this.get());
  }
  start(callback) {
    var inter = setInterval(function () {
      if (maincamManager.get().readyState == 4) {
        maincamManager.get().muted = false;
        maincamManager.get().play();
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

  async addNewStudentCam(stream, track) {
    let userlist = connection.peers.getAllParticipants();
    let isFind = false;

    let el = document.createElement("video")
    try {
      el.controls = false;
      el.style.width = "100%";
      el.style.height = "100%";
      el.style.pointerEvents = "none";
      el.style.position = "absolute";
      el.autoplay = true;
      el.setAttribute("id", stream.id);
      if ('srcObject' in el) {
        el.srcObject = stream;
      } else {
        el.src = URL.createObjectURL(stream);
      }

      connection.socket.emit("get-student-cam", {
        streamid: stream.id
      }, function (e) {
        let childern = document.getElementById('student_list').getElementsByClassName('student');
        for (let i = 0; i < childern.length; i++) {
          let child = childern[i];
          if (child.dataset.id == e) {
            child.appendChild(el);
            isFind = true;
            break;
          }
        }


        if (classroomInfo.showcanvas) {
          Hide(el)
        }

        var playPromise = el.play();

        if (playPromise !== undefined) {
          playPromise.then(_ => {
            track.paused = false;
            // Automatic playback started!
            // Show playing UI.
            // We can now safely pause video...
            el.play();
          })
            .catch(error => {
              console.log(error);
              // Auto-play was prevented
              // Show paused UI.
            });
        }


      })

    }

    catch {
      console.log("No Cam")
    }

  }

  addNewTeacherCam(stream) {
    console.log("Addnew teacher", stream.id);
    this.srcObject(stream);
    this.start();
    classroomInfo.camshare = {
      id: stream.id
    };

  }

  eventListener(event) {
  }
}