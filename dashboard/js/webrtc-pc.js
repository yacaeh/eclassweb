// New WebRTC Functions
const log = (msg) =>
  (document.getElementById('logs').innerHTML += msg + '<br>');

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const config = {
  iceServers: [
    {
      urls: ["turn:turn.primom.co.kr:443",
        "turn:turn.primom.co.kr:443?transport=udp",
        "turn:turn.primom.co.kr:443?transport=tcp"
      ],
      username: "primomceo",
      credential: "webrtc"

    }
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


let localStream;
let screenStream;
let screenSender;
let nego = false;
let currentid = undefined;

let streamlist = {};

async function webRTCPCInit() {
  try {

    let resolutionOption = connection.extra.roomOwner ? 'qvga' : 'thumb';

    let options = {
      resolution: resolutionOption,
      audio: true,
      video: true,
    };


    let join = async () => {
      console.log('Join to stream new video');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer)
        .catch(function (e) {
          console.log(e)
        });
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
          // Hook this here so it's not called before joining
          pc.onnegotiationneeded = async function () {
            const offer = await pc.createOffer()
              .catch(function (e) {
                console.error(e)
              });
            await pc.setLocalDescription(offer)
              .catch(function (e) {
                console.error(e)
              });

            const id = uuidv4();
            socket.send(
              JSON.stringify({
                method: 'offer',
                params: { desc: offer },
                id: id
              })
            );
            nego = true;

            socket.addEventListener("message", (event) => {
              const resp = JSON.parse(event.data);
              if (resp.id === id) {
                pc.setRemoteDescription(resp.result);
              }
            });
          };

          pc.setRemoteDescription(resp.result)
            .catch(function (e) {
              console.error(e)
            });

        } else if (resp.method == "trickle") {
          pc.addIceCandidate(resp.params);
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
          track.paused = true;
          pc.addTrack(track, localStream);
          if (connection.extra.roomOwner && !teacherAdded) {
            teacherAdded = true;
            maincamManager.addNewTeacherCam(localStream);
            track.paused = false;
            connection.socket.emit("update-teacher-cam", Object.assign({}, classroomInfo), function (e) {});
          }
 
          connection.socket.emit("update-student-cam", Object.assign({}, 
            {id: connection.userid, streamid: stream.id}), function (e) {});
        });
        pc.addTransceiver('video', {
          direction: 'sendrecv',
        });
        pc.addTransceiver('audio', {
          direction: 'sendrecv',
        });

        join();
      })
      .catch((err) => {
        pc.addTransceiver('video', {
          direction: 'recvonly',
        });
        pc.addTransceiver('audio', {
          direction: 'recvonly',
        });

        join();
      });


    pc.ontrack = function ({ track, streams }) {
      streams.forEach((stream) => {
        streamlist[stream.id] = stream;
        track.paused = true;

        // screen share
        if (track.kind === 'video') {
          if (
            stream.id == classroomInfo.shareScreen.id &&
            classroomInfo.shareScreen.state
          ) {
            screenStream = stream;
            screenshareManager.streamstart(stream);
            track.paused = false;


            track.onended = function (event) {
              screenshareManager.onclose();
            };

          }

          // webcam
          else {
            track.onunmute = () => {
              if (classroomInfo.camshare.id == stream.id) {
                if (!connection.extra.roomOwner) {
                  maincamManager.addNewTeacherCam(stream);
                  track.paused = false;
                }
              } 
              maincamManager.addNewStudentCam(stream, track)
            };
          }
        }
      });
    };

    pc.oniceconnectionstatechange = function () {
      if (pc.iceConnectionState == 'disconnected') {
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
        await pc.setRemoteDescription(resp.params)
          .catch(function (e) {
            console.log(e)
          });

        const answer = await pc.createAnswer()
          .catch(function (e) {
            console.log(e)
          });

        await pc.setLocalDescription(answer)
          .catch(function (e) {
            console.log(e)
          });


        const id = uuidv4();
        socket.send(
          JSON.stringify({
            method: 'answer',
            params: { desc: answer },
            id,
          })
        );
      }

      /////////////////////////////////////////////////



    });

  } catch (err) {
    console.log(err);
  }
}
