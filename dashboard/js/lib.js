
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
  return widgetContainer.getElementsByTagName('iframe')[0].contentWindow;
}

function Show(element) {
  if (!element) return;
    typeof element === "string" ? document.getElementById(element).style.display = "block"
    : element.style.display = "block";
}

function Hide(element) {
  if (!element) return;
  typeof element === "string" ? document.getElementById(element).style.display = "none"
                              : element.style.display = "none";
}

// 알림 박스 생성
function alertBox(message, title, callback_yes, callback_no) {
  rightTab.style.zIndex = 1;
  callback_yes = callback_yes || function () { };

  if (typeof (callback_no) == "string") {
    $('.btn-alert-no').hide();
    $('.btn-alert-yes').text(window.langlist.CONFIRM);
    $('.btn-alert-yes').css("width", "100%");
  }
  else {
    $('.btn-alert-no').show();
    $('.btn-alert-yes').text(window.langlist.YES);
    $('.btn-alert-no').text(window.langlist.NO);
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

  $('#alert-title').html(title || window.langlist.NOTIFICATION);
  $('#alert-content').html(message);
  $('#alert-box').fadeIn(300);
}

function PostAsync(url, data) {
  return axios.post(url, data).then(function (e) {
    return e.data;
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

function GetParamsFromURL(){
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
