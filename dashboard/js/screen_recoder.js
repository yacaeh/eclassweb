class sc {

    RecordingStart() {
        var now = 0;
        var recordingTime = document.getElementById("recording-time");
        var text = recordingTime.getElementsByClassName("text")[0];

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
        var recordingTime = document.getElementById("recording-time");
        var text = recordingTime.getElementsByClassName("text")[0];
        document.getElementById("current-time").style.lineHeight = "36px";
        recordingTime.style.display = 'none';
        text.innerHTML = '0:00:00';
    }

    static _startScreenCapture() {
  
        var constraints = {video: {
            mediaSource: "screen", 
            width: 1280, 
            height: 720}};

        if (navigator.getDisplayMedia) {
            return navigator.getDisplayMedia(constraints);
        } else if (navigator.mediaDevices.getDisplayMedia) {
            return navigator.mediaDevices.getDisplayMedia(constraints);
        } else {
            return navigator.mediaDevices.getUserMedia(constraints);
        }
    }

    async _startCapturing(e) {
        console.log('Start capturing.');

        this.status = 'Screen recording started.';
        this.enableStartCapture = false;
        this.enableStopCapture = true;
        this.enableDownloadRecording = false;

        if (this.recording) {
            window.URL.revokeObjectURL(this.recording);
        }

        this.chunks = [];
        this.recording = null;
        try {
            this.stream = await sc._startScreenCapture();
            document.getElementById("top_record_video").classList.add("on");
            this.RecordingStart();
        }
        catch{
            return false;
        }

        this.stream.addEventListener('inactive', e => {
            this.RecodingStop();
            document.getElementById("top_record_video").classList.remove("on");
            this._stopCapturing(e);
        });

        this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: 'video/webm' });

        this.mediaRecorder.addEventListener('dataavailable', event => {
            if (event.data && event.data.size > 0) {
                this.chunks.push(event.data);
            }
        });


        this.mediaRecorder.start(10);
    }

    _stopCapturing(e) {
        if (!this.enableStopCapture)
            return false;

            this.status = 'Screen recorded completed.';
        this.enableStartCapture = true;
        this.enableStopCapture = false;
        this.enableDownloadRecording = true;

        this.mediaRecorder.stop();
        this.mediaRecorder = null;
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;

        this.recording = window.URL.createObjectURL(new Blob(this.chunks, { type: 'video/webm' }));
        this._downloadRecording();

    }

    _downloadRecording(e) {
        this.enableStartCapture = true;
        this.enableStopCapture = false;
        this.enableDownloadRecording = false;

        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hour = date.getHours();
        var min = date.getMinutes();
        var sec = date.getSeconds();
        var name = year + "년" + month + "월" + day + "일 " + hour + "시" + min + "분" + sec + "초";

        const downloadLink = document.querySelector('a#downloadLink');
        downloadLink.addEventListener('progress', e => console.log(e));
        downloadLink.href = this.recording;
        downloadLink.download = name + '-수업녹화.webm';
        downloadLink.click();
    }
}

var screen_recorder = new sc();