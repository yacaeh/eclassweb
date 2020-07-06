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


    mergeAudioStreams = () => {
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

        this.rec = new MediaRecorder(this.stream, { mimeType: 'video/webm; codecs=vp8,opus' });

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

    // -----------------------------------------------------


function ScreenShare(btn) {
  if (!isSharingScreen && checkSharing()) {
    removeOnSelect(btn);
    return;
  }

  var on = $(btn).hasClass('on');

  if (!connection.extra.roomOwner && connection.userid != classroomInfo.nowClassPermission) {
    alert('화면 공유 권한이 없습니다');
    $(btn).removeClass("on selected-shape")
    return;
  }

  if (!on) {
    isSharingScreen = false;
    lastStream.getTracks().forEach((track) => track.stop());
    connection.send({
      hideMainVideo: true,
    });
    return false;
  }

  screen_constraints = {
    screen: true,
    oneway: true,
  };

  if (navigator.mediaDevices.getDisplayMedia) {
    navigator.mediaDevices.getDisplayMedia(screen_constraints).then(
      (stream) => {
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



