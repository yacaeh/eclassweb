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
    console.log(video);

    return video ? video : GetWidgetFrame().document.getElementById("main-video");
  }

  async AddCamStream(stream) {
    let isFind = false;
    try {

      connection.socket.emit("get-cam-stream-id", { streamid: stream.id }, function (e) {
        if (e == GetOwnerId()) {
            maincamManager.get().srcObject = stream;
            if(store.getState().isMobile){
              document.getElementById('canvas-div').appendChild(maincamManager.get());
              maincamManager.get().classList.add("mobile");

            }
        }

        streamContainer[e] = stream;
        var videoElement;
        let childern = document.getElementById('student_list').getElementsByClassName('student');

        for (let i = 0; i < childern.length; i++) {
          let child = childern[i];
          if (child.dataset.id == e) {
            videoElement = child.getElementsByClassName('student_cam')[0];
            videoElement.srcObject = stream;
            isFind = true;
            break;
          }
        }

        if (classroomInfo.showcanvas) { videoElement.style.display = 'none'; }
      })
    }

    catch {
      console.log("No Cam")
    }

  }
}