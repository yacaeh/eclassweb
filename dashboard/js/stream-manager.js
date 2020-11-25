class ScreenShareManagerClass {
  constructor() {
    this.isScreenShare = false;
    this.lastStream = undefined;
    this.self = this;
    this.senders = [];
    this.sender = undefined;
  }

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
    screenshareManager.show();
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
      connection.userid != classroomInfo.permissions.classPermission) {
      alert(window.langlist.NO_SCREEN_PERMISSION);
      btn.classList.remove("on");
      btn.classList.remove("selected-shape");
      return;
    }

    if (on) {
      screenshareManager.isSharingScreen = false;

      if (typeof (screenshareManager.lastStream) !== "undefined")
      console.log("SCreenshare stop on ");
      screenshareManager.lastStream.getTracks().forEach((track) => track.stop());
      btn.classList.remove("on");
      return false;
    }

    if (classroomInfo.shareScreen.state) {
      alert(window.langlist.SOMEONE_USING_SCREEN);
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
          screenshareManager.get().volume = 0;
          screenshareManager.isSharingScreen = true;
          screenshareManager.lastStream = stream;

          let track = stream.getVideoTracks()[0];
          this.sender = pc.addTrack(track, stream);

          track.onended = () => { // Click on browser UI stop sharing button
            console.info("Sharing has ended");
            screenshareManager.onclose();
            pc.removeTrack(this.sender);
            this.sender = undefined;
          };
          
          // pc.getSenders()[2].replaceTrack(screenshareManager.lastStream.getVideoTracks()[0]);

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
            screenshareManager.hide();

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
      screenshareManager.srcObject(stream);
      classroomInfo.shareScreen = {
        state: true,
        id: stream.id,
        userid: connection.userid
      };
      classroomManager.updateClassroomInfo((result) => console.log(result));
      screenshareManager.start(stream, btn);
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
      screenshareManager.hide();
      classroomInfo.shareScreen = {
        state: false,
        id: undefined,
        userid: undefined
      }
      return true;
    }

    if (event.data.studentStreaming) {
      console.log("Student Start Streaming");
      screenshareManager.start(event.data.studentStreaming)
      return true;
    }
  }
}

class maincamManagerClass {
  get() {
    let video = document.getElementById("main-video");
    return video ? video : GetWidgetFrame().document.getElementById("main-video");
  }
  show() {
    this.get().style.display = 'block';
  }
  hide() {
    this.get().style.display = 'none';
  }
  start(callback) {
    var inter = setInterval(function () {
      if (maincamManager.get().readyState == 4) {
        connection.extra.roomOwner ? maincamManager.get().muted = true : maincamManager.get().muted = false;
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
    let isFind = false;
    let el = document.createElement("video");
    console.log("ADD NEW CAM", stream.id)
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
        console.log(e);
        let childern = document.getElementById('student_list').getElementsByClassName('student');
        for (let i = 0; i < childern.length; i++) {
          let child = childern[i];
          if (child.dataset.id == e) {
            console.log(child);
            child.appendChild(el);
            isFind = true;
            break;
          }
        }

        if (classroomInfo.showcanvas) {
          el.style.display = 'none';
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
}