// New WebRTC Functions
const log = (msg) =>
  (document.getElementById('logs').innerHTML += msg + '<br>');

const config = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun.l.google.com:19302?transport=udp',
      ],
    },
  ],
};
const socket = new WebSocket(wsuri);
const pc = new RTCPeerConnection(config);
let teacherAdded = false;

const VideoResolutions = {
    thumb: { width: { ideal: 82 }, height: { ideal: 58 } },
    qvga: { width: { ideal: 320 }, height: { ideal: 180 } },
    vga: { width: { ideal: 640 }, height: { ideal: 360 } },
    shd: { width: { ideal: 960 }, height: { ideal: 540 } },
    hd: { width: { ideal: 1280 }, height: { ideal: 720 } },
    fhd: { width: { ideal: 1920 }, height: { ideal: 1080 } },
    qhd: { width: { ideal: 2560 }, height: { ideal: 1440 } },
  };

let resolutionOption = connection.extra.roomOwner ? 'hd' : 'thumb';

let options = {
  codec: 'VP9',
  resolution: resolutionOption,
  audio: true,
  video: true,
};

let localStream;
let screenStream;
let screenSender;
let nego = false;
let currentid = undefined;

let streamlist = {};

async function webRTCPCInit() {
  try {
    console.log('classroomInfo.shareScreen.id ', classroomInfo.shareScreen.id);

    pc.ontrack = function ({ track, streams }) {
      console.log('New track added!', streams);
      streams.forEach((stream) => {
        streamlist[stream.id] = stream;
        track.paused = true;

        // screen share
        if (track.kind === 'video') {
          if (
            stream.id == classroomInfo.shareScreen.id &&
            classroomInfo.shareScreen.state
          ) {
            console.log('Share Screen!', stream.id);
            screenStream = stream;
            newscreenshareManager.streamstart(stream);
            track.paused = false;

            track.onended = function (event) {
              console.log("On ended!");
              newscreenshareManager.onclose();
            };

          } 
          
          // webcam
          else {
            track.onunmute = () => {
              if (classroomInfo.camshare.id == stream.id) {
                if (!connection.extra.roomOwner) {
                  maincamManager.addNewTeacherCam(stream);
                  maincamManager.show();
                  track.paused = false;
                }
              } else {
                if(connection.extra.roomOwner)
                maincamManager.addNewStudentCam(stream, track)
              }
            };
          }
        }
      });
    };

    pc.oniceconnectionstatechange = function() {
      console.log("on iceconnectionstatechange!");
      if(pc.iceConnectionState == 'disconnected') {
          console.log('Disconnected');
      }
    }

    pc.onicecandidate = (event) => {
      if (event.candidate !== null) {
        socket.send(
          JSON.stringify({
            method: 'trickle',
            params: {
              candidate: event.candidate,
            },
          })
        );
      }
    };

    socket.addEventListener('message', async (event) => {
      const resp = JSON.parse(event.data);

      // Listen for server renegotiation notifications
      if (!resp.id && resp.method === 'offer') {
        log(`Got offer notification`);
        console.log("offer set remote description");
        await pc.setRemoteDescription(resp.params)
        .catch(function(e) {
          console.log(e)});
        console.log("resp.params",resp.params);
        
        const answer = await pc.createAnswer()
        .catch(function(e) {
          console.log(e)});

        await pc.setLocalDescription(answer)
        .catch(function(e) {
          console.log(e)});
      

        const id = connection.userid;
        log(`Sending answer`);
        socket.send(
          JSON.stringify({
            method: 'answer',
            params: { desc: answer },
            id,
          })
        );
      } else if (resp.method === 'trickle') {
        pc.addIceCandidate(resp.params).catch(log);
      }

      /////////////////////////////////////////////////


      
    });

    let join = async () => {
      console.log('Join to stream new video');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer)
      .catch(function(e) {
        console.log(e)});
      const id = connection.userid;
      socket.send(
        JSON.stringify({
          method: 'join',
          params: { sid: params.sessionid, offer: pc.localDescription },
          id,
        })
      );

      socket.addEventListener('message', (event) => {
        const resp = JSON.parse(event.data);
        if (resp.id === id) {
          console.log(resp.id);
          log(`Got publish answer`);

          // Hook this here so it's not called before joining
          pc.onnegotiationneeded = async function () {
            try{
              log('Renegotiating');
              console.log("renegotiating!");
              const offer = await pc.createOffer()
              .catch(function(e) {
                console.error(e)});
              await pc.setLocalDescription(offer)
              .catch(function(e) {
                console.error(e)});
  
              currentid = Math.random().toString();
              socket.send(
                JSON.stringify({
                  method: 'offer',
                  params: { desc: pc.localDescription },
                  id : currentid
                })
              );
              nego = true;  
            }
            catch(err) {
              console.error(err);
            }
          };

          pc.setRemoteDescription(resp.result)
          .catch(function(e) {
            console.error(e)});

          console.log("join offer renegotiation set remote description");
        }

        if(nego){
          console.error("MEWSSAGE")
          if (resp.id === currentid) {
            log(`Got renegotiation answer`);
           async()=>{ await pc.setRemoteDescription(resp.result)
            .catch(function(e) {
              console.error(e)});
            }
          }
        }
      });
      
    };

    await navigator.mediaDevices
      .getUserMedia({
        video:
          options.video instanceof Object
            ? {
                ...VideoResolutions[options.resolution],
                ...options.video,
              }
            : options.video
            ? VideoResolutions[options.resolution]
            : false,
        audio: options.audio,
      })
      .then((stream) => {
        localStream = stream;
        localStream.getTracks().forEach((track) => {
          console.log(track);
          track.paused = true;
          pc.addTrack(track, localStream);
          if (connection.extra.roomOwner && !teacherAdded) {
            console.log('Add teacher!');
            teacherAdded = true;
            maincamManager.addNewTeacherCam(localStream);
            maincamManager.hide();
            console.log('hide');
            track.paused = false;
            connection.socket.emit("update-teacher-cam", Object.assign({}, classroomInfo), function (e) {
              console.log('updated teacher cam');
            });
          }

          if (!connection.extra.roomOwner)
            connection.socket.emit("update-student-cam", Object.assign({}, {
              id: connection.userid,
              streamid: stream.id
            }), function (e) {
              console.log('updated teacher cam');
            });


        });
        pc.addTransceiver('video', {
          direction: 'sendrecv',
        });
        pc.addTransceiver('audio', {
          direction: 'sendrecv',
        });

        join();
      })
      .catch(log);
  } catch (err) {
    console.log(err);
  }
}
