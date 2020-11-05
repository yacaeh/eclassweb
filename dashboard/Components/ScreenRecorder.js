class ScreenRecorder extends React.Component {
    state = {
        recording : false,
    }
    constructor(props){
        super(props);
        this.clickHandler = this.clickHandler.bind(this);
    }

    render() {
       return <img className="top_icon" id="top_record_video" onClick={this.clickHandler} />
    }

    clickHandler = async (e) => {
        await this.setState({recording : !this.state.recording});
        if(this.state.recording){
            let ret = await screenRecorder._startCapturing();
        }
        else{
            screenRecorder._stopCapturing();
        }
    }
}

class screenRecorderClass {
    RecordingStart() {
      let now = 0;
      let recordingTime = document.getElementById("recording-time");
      let text = recordingTime.getElementsByClassName("text")[0];
  
      document.getElementById("top_record_video").classList.add("on");
      document.getElementById("current-time").style.lineHeight = "18px";
      recordingTime.style.display = 'block';
  
      function timer() {
        now += 1;
        let time = now;
        let hour = Math.floor(time / 3600);
        time %= 3600;
        let min = ("00" + Math.floor(time / 60)).slice(-2);
        time = ("00" + (time % 60)).slice(-2);
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