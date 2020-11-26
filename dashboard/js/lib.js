
// 이벤트 추가
function AddEvent(id, event, callback) {
  var element = document.getElementById(id);
  if (element)
    element.addEventListener(event, function () {
      callback(this);
    })
}

// 방장의 id를 받아옴
function GetOwnerId() {
  var id;
  connection.peers.forEach(function (e) {
    if (e.extra.roomOwner) {
      id = e.userid
    }
  })

  return id;
}

function CheckLogin() {
  if (!window.params.userFullName) {

    let request = new XMLHttpRequest();
    request.open('POST', '/get-now-account', false);
    request.send(JSON.stringify({ id: params.sessionid }));

    if (request.status === 200) {
      const ret = JSON.parse(request.responseText);
      console.log(ret)
      if (ret.code == 400) {
        console.error("no login info")
        alert("로그인 정보가 없습니다");
        location.href = '/dashboard/login.html';
      }
      else {
        connection.userid = ret.data.uid;
        connection.byLogin = true;
        connection.extra.userFullName = ret.data.name;
      }
    }
  }
}
// canvas element 를 받아옴
function GetWidgetFrame() {
  return widgetContainer.getElementsByTagName('iframe')[0].contentWindow;
}

function PostAsync(url, data) {
  return axios.post(url, data).then(function (e) {
    return e.data;
  })
}

async function SetNowLoginInfo() {
  const info = await PostAsync("/get-now-account", {});
  logininfo = info;
  console.log(info);

  if (info.code == 200) {
    window.params.userFullName = logininfo.data.name;
  }
  return info;
}

function GetParamsFromURL() {
  let params = {},
    r = /([^&=]+)=?([^&]*)/g;

  function d(s) {
    return decodeURIComponent(s.replace(/\+/g, ' '));
  }
  let match,
    search = window.location.search;
  while ((match = r.exec(search.substring(1))))
    params[d(match[1])] = d(match[2]);
  window.params = params;
  return params;
}

// ----------------------------------------------------------------------

function showusers() {
  connection.socket.emit('get-userlist', (e) => {
    console.log(e);
  })
}

function getrooms() {
  connection.socket.emit('get-rooms', (e) => {
    console.log(e);
  })
}

function showstatus() {
  connection.socket.emit("show-class-status",
    (rooms) => {
      console.log(rooms)
    })
}
