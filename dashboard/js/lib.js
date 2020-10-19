
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

// canvas element 를 받아옴
function GetWidgetFrame() {
  let frame = widgetContainer.getElementsByTagName('iframe')[0].contentWindow;
  return frame;
}

function Show(element) {
  if (!element)
    return;

  if (typeof element === "string") {
    document.getElementById(element).style.display = "block";
  }
  else {
    element.style.display = "block";
  }
}

function Hide(element) {
  if (!element)
    return;

  if (typeof element === "string") {
    document.getElementById(element).style.display = "none";
  }
  else {
    element.style.display = "none";
  }
}

// 알림 박스 생성
function alertBox(message, title, callback_yes, callback_no) {
  rightTab.style.zIndex = 1;


  callback_yes = callback_yes || function () { };

  if (typeof (callback_no) == "string") {
    $('.btn-alert-no').hide();
    $('.btn-alert-yes').text($.i18n('CONFIRM'));
    $('.btn-alert-yes').css("width", "100%");
  }
  else {
    $('.btn-alert-no').show();
    $('.btn-alert-yes').text($.i18n('YES'));
    $('.btn-alert-yes').css("width", "50%");
  }

  callback_no = callback_no || function () { };

  var clickCount = 0;

  $('.btn-alert-yes').unbind('click').bind('click', function (e) {
    if (clickCount++ == 0) {
      e.preventDefault();
      $.when($('#alert-box').fadeOut(300)).done(() => {
        rightTab.style.zIndex = 2;
      });
      callback_yes();
    }
  });

  $('.btn-alert-no').unbind('click').bind('click', function (e) {
    if (clickCount++ == 0) {
      e.preventDefault();
      $.when($('#alert-box').fadeOut(300)).done(() => {
        rightTab.style.zIndex = 2;
      });
      callback_no();
    }
  });

  $('#alert-title').html(title || $.i18n('NOTIFICATION'));
  $('#alert-content').html(message);
  $('#alert-box').fadeIn(300);
}

function Post(url, data, callback) {
  let xml = new XMLHttpRequest();
  xml.open("POST", url, true);
  xml.setRequestHeader('Content-Type', 'application/json'); // 컨텐츠타입을 json으로
  xml.send(JSON.stringify(data));
  xml.addEventListener("readystatechange", function (data) {
    if (xml.readyState == xml.DONE && xml.status == 200) {
      callback(JSON.parse(xml.responseText));
    }
  })
  return xml
}

function PostAsync(url, data) {
  return axios.post(url, data).then(function (e) {
    return e.data;
  })
}

function GetAsync(url) {
  return axios.get(url).then(function (e) {
    return e.data;
  })
}

function Get(url, callback) {
  let xml = new XMLHttpRequest();
  xml.open("GET", url);
  xml.send();

  xml.addEventListener("readystatechange", function (data) {
    if (xml.readyState == xml.DONE && xml.status == 200) {
      callback(xml.responseText);
    }
    else if (xml.readyState == xml.DONE && xml.status == 404) {
      callback(xml.status);
    }

  })
}


async function SetNowLoginInfo(){
  const info = await PostAsync("/get-now-account", {});
  logininfo = info;
  console.log(info);
  
  if(info.code == 200){
    window.params.userFullName =  logininfo.data.name;
  }
  return info;
}

// ----------------------------------------------------------------------

function showusers(){
  connection.socket.emit('get-userlist', (e) => {
    console.log(e);
  })
}

function showrooms(){
  connection.socket.emit('show-class-status', (e) => {
      console.log(e);
  })
}
function showstatus() {
  connection.socket.emit("show-class-status",
    (rooms) => {
      console.log(rooms)
    })
}
