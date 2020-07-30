
// 이벤트 추가
function AddEvent(id, event, callback) {
    document.getElementById(id).addEventListener(event, function () {
        callback();
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
    let frame = document.getElementById('widget-container').getElementsByTagName('iframe')[0].contentWindow;
    return frame;
}

// 화면 공유 스크린 Get
function GetScreenSharingCanvas() {
    return GetWidgetFrame().document.getElementById("screen-viewer");
}

// Get 선생 캠
function GetMainVideo() {
    var video = document.getElementById("main-video");
    if (video) {
      return video;
    }
    else {
      return GetWidgetFrame().document.getElementById("main-video");
    }
}

function Show(element){
    if(typeof element === "string"){
        document.getElementById(element).style.display = "block";
    }
    else{
        element.style.display = "block";
    }
}

function Hide(element){
    if(typeof element === "string"){
        document.getElementById(element).style.display = "none";
    }
    else{
        element.style.display = "none";
    }
}

// 알림 박스 생성
function alertBox(message, title, callback_yes, callback_no) {
    callback_yes = callback_yes || function () { };
    callback_no = callback_no || function () { };
  
    var clickCount = 0;
  
    $('.btn-alert-yes').unbind('click').bind('click', function (e) {
      if (clickCount++ == 0) {
        e.preventDefault();
        $('#alert-box').fadeOut(300);
        callback_yes();
      }
    });
    $('.btn-alert-no').unbind('click').bind('click', function (e) {
      if (clickCount++ == 0) {
        e.preventDefault();
        $('#alert-box').fadeOut(300);
        callback_no();
      }
    });
  
    $('#alert-title').html(title || '알림');
    $('#alert-content').html(message);
    $('#alert-box').fadeIn(300);
}

// 알림 박스 생성
function alert_exit_Box(message, title, callback_yes, callback_no) {
    callback_yes = callback_yes || function () { };
    callback_no = callback_no || function () { };
  
    var clickCount = 0;
  
    $('.btn-alert-exit-yes')
      .unbind('click')
      .bind('click', function (e) {
        if (clickCount++ == 0) {
          e.preventDefault();
          $('#alert-exit').fadeOut(300);
          callback_yes();
        }
      });
    $('.btn-alert-exit-no')
      .unbind('click')
      .bind('click', function (e) {
        if (clickCount++ == 0) {
          e.preventDefault();
          $('#alert-exit').fadeOut(300);
          callback_no();
        }
      });
  
    $('#alert-exit-title').html(title || '알림');
    $('#alert-exit-content').html(message);
    $('#alert-exit').fadeIn(300);
  }