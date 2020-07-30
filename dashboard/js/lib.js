
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
    if(typeof element == "string"){
        document.getElementById(element).style.display = "block";
    }
    else{
        element.style.display = "block";
    }
}

function Hide(element){
    if(typeof element == "string"){
        document.getElementById(element).style.display = "none";
    }
    else{
        element.style.display = "none";
    }
}