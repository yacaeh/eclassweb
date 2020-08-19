
// 이벤트 추가
function AddEvent(id, event, callback) {
    document.getElementById(id).addEventListener(event, function () {
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
    let frame = document.getElementById('widget-container').getElementsByTagName('iframe')[0].contentWindow;
    return frame;
}

function Show(element){
  if(!element)
    return;

    if(typeof element === "string"){
        document.getElementById(element).style.display = "block";
    }
    else{
        element.style.display = "block";
    }
}

function Hide(element){
  if(!element)
  return;
  
    if(typeof element === "string"){
        document.getElementById(element).style.display = "none";
    }
    else{
        element.style.display = "none";
    }
}

// 알림 박스 생성
function alertBox(message, title, callback_yes, callback_no) {
  $(".right-tab").css("z-index",1);
    callback_yes = callback_yes || function () { };
    callback_no = callback_no || function () { };
  
    var clickCount = 0;
  
    $('.btn-alert-yes').unbind('click').bind('click', function (e) {
      if (clickCount++ == 0) {
        e.preventDefault();
        
        $.when($('#alert-box').fadeOut(300)).done(function(){
          $(".right-tab").css("z-index",2);
        });

        callback_yes();
      }
    });
    $('.btn-alert-no').unbind('click').bind('click', function (e) {
      if (clickCount++ == 0) {
        e.preventDefault();
        
        $.when($('#alert-box').fadeOut(300)).done(function(){
          $(".right-tab").css("z-index",2);
        });

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


function Post(url, data, callback){
  let xml = new XMLHttpRequest();
  xml.open("POST", url);
  xml.setRequestHeader('Content-Type', 'application/json'); // 컨텐츠타입을 json으로
  xml.send(data);
  xml.addEventListener("readystatechange", function(data){
    if(xml.readyState == xml.DONE && xml.status == 200){
      callback(xml.responseText);
    }
  })
}

function Get(url, callback){
  let xml = new XMLHttpRequest();
  xml.open("GET", url);
  xml.send();
  xml.addEventListener("readystatechange", function(data){
    if(xml.readyState == xml.DONE && xml.status == 200){
      callback(xml.responseText);
    }
  })
}
