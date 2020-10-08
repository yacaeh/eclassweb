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
const wsuri = `wss://192.168.124.41:7000/ws`;
const socket = new WebSocket(wsuri);
const pc = new RTCPeerConnection(config);

const VideoResolutions = {
    thumb: { width: { ideal: 82 }, height: { ideal: 58 } },
    qvga: { width: { ideal: 320 }, height: { ideal: 180 } },
    vga: { width: { ideal: 640 }, height: { ideal: 360 } },
    shd: { width: { ideal: 960 }, height: { ideal: 540 } },
    hd: { width: { ideal: 1280 }, height: { ideal: 720 } },
    fhd: { width: { ideal: 1920 }, height: { ideal: 1080 } },
    qhd: { width: { ideal: 2560 }, height: { ideal: 1440 } },
  };

let resolutionOption = 'hd';
if (params.open === 'false') resolutionOption = 'thumb';

let options = {
codec: 'VP9',
resolution: resolutionOption,
audio: true,
video: true,
};

let localStream;
let screenStream;


async function checkScreenSharing() {
  await classroomInfo.shareScreen.id;
  console.log('Checking screen state!' + classroomInfo.shareScreen.id);
}

async function webRTCPCInit() {
  try {
    console.log('classroomInfo.shareScreen.id ', classroomInfo.shareScreen.id);
    pc.ontrack = function ({ track, streams }) {
      console.log('New track added!');
      checkScreenSharing();
      streams.forEach((stream) => {
        if (track.kind === 'video') {
          console.log(
            'classroomInfo.shareScreen.id',
            classroomInfo.shareScreen.id,
            'state:',
            classroomInfo.shareScreen.state
          );
          if (
            classroomInfo.shareScreen.id !== undefined &&
            stream.id == classroomInfo.shareScreen.id &&
            classroomInfo.shareScreen.state
          ) {
            console.log('Share Screen!');
            newscreenshareManager.streamstart(stream);
          } else {
            track.onunmute = () => {
              console.log(
                'classroomInfo.camshare.id',
                classroomInfo.camshare.id
              );
              if (classroomInfo.camshare.id == stream.id) {
                if (params.open == 'false')
                  maincamManager.addNewTeacherCam(stream);
              } else {
                if (connection.peers.getAllParticipants().length > 0)
                  maincamManager.addNewStudentCam(
                    connection.peers.getAllParticipants(),
                    stream
                  );
              }
            };
          }
        }
      });
    };

    pc.oniceconnectionstatechange = (e) =>
      log(`ICE connection state: ${pc.iceConnectionState}`);
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
        await pc.setRemoteDescription(resp.params);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

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
    });

    let join = async () => {
      console.log('Join to stream new video');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const id = connection.userid;
      console.log('params.sessionid:' + params.sessionid);
      console.log('connection.userid:' + connection.userid);
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
          log(`Got publish answer`);

          // Hook this here so it's not called before joining
          pc.onnegotiationneeded = async function () {
            log('Renegotiating');
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            const id = connection.userid;
            socket.send(
              JSON.stringify({
                method: 'offer',
                params: { desc: offer },
                id,
              })
            );

            socket.addEventListener('message', (event) => {
              const resp = JSON.parse(event.data);
              if (resp.id === id) {
                log(`Got renegotiation answer`);
                pc.setRemoteDescription(resp.result);
              }
            });
          };

          pc.setRemoteDescription(resp.result);
        }
      });
    };

    navigator.mediaDevices
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
          pc.addTrack(track, localStream);
          if (params.open === 'true') {
            console.log('Add teacher!');
            maincamManager.addNewTeacherCam(localStream);
          }
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
    console.err(err);
  }
}
webRTCPCInit();