/*
    캔버스, 판서 관련
*/

var designer = new CanvasDesigner();
designer.widgetHtmlURL = './canvas/widget.html';
designer.widgetJsURL = './widget.js';
designer.icons.pencil = '/dashboard/img/pen.png';
designer.icons.marker = '/dashboard/img/pen2.png';
designer.icons.eraser = '/dashboard/img/eraser.png';
designer.icons.clearCanvas = '/dashboard/img/trash.png';
designer.icons.pdf = '/dashboard/img/iconfinder_File.png';
designer.icons.on = '/dashboard/img/view_on.png';
designer.icons.off = '/dashboard/img/view_off.png';
designer.icons.screenShare = '/dashboard/img/screenshare.png';
designer.icons.view3d = '/dashboard/img/3D.png';
designer.icons.view3don = '/dashboard/img/3D.png';
designer.icons.movie = '/dashboard/img/videolink.png';
designer.icons.file = '/dashboard/img/openfile.png';
designer.icons.text = '/dashboard/img/text.png';
designer.icons.epub = '/dashboard/img/epub.png';
designer.icons.callteacher = '/dashboard/img/handsup.png';
designer.icons.homework = '/dashboard/img/homework.png';
designer.icons.fulloff = '/dashboard/img/cam_min.png';
designer.icons.fullon = '/dashboard/img/cam_max.png';

designer.addSyncListener(function (data) {
    var isStudent = data.userid == classroomInfo.canvasPermission;
    if (connection.extra.roomOwner || isStudent) {
        data.isStudent = isStudent;
        connection.send(data);
    }
});

designer.setTools({
    pencil: true,
    text: true,
    image: false,
    pdf: false,
    eraser: true,
    line: true,
    arrow: false,
    dragSingle: false,
    dragMultiple: false,
    arc: false,
    rectangle: false,
    quadratic: false,
    bezier: false,
    marker: true,
    zoom: false,
    lineWidth: false,
    colorsPicker: false,
    clearCanvas: true,
    onoff: true,
    code: false,
    undo: true,
    screenShare: true,
    view3d: true,
    movie: true,
    file: true,
    callteacher: true,
    homework: true,
});

function SetCanvasBtn(data) {

    function checkf() {
        if (designer.iframe != null) {
            clearInterval(inter)
            var frame = GetWidgetFrame();

            Object.keys(data).forEach(function (e) {
                var btn = frame.document.getElementById(e);
                if (btn)
                    btn.addEventListener("click", function () {
                        data[e](btn);
                    })
            })
        }
    }
    var inter = setInterval(checkf, 1000);
}

function checkSharing() {
    return classroomInfo.shareScreen.state ||
        classroomInfo.share3D.state ||
        isSharingMovie ||
        isSharingFile ||
        isSharingEpub;
}

function removeOnSelect(btn) {
    alert('동시에 여러 기능을 공유할 수 없습니다');
    btn.classList.remove("on");
    btn.classList.remove("selected-shape");
}

function SendCanvasDataToOwner() {
    if(connection.extra.roomOwner)
        return;
        
    var canvas = GetWidgetFrame().document.getElementById('main-canvas');
    var ownerid;
    setTimeout(function () {
        var interval = setTimeout(function () {
            ownerid = GetOwnerId();
            if (ownerid != undefined) {
                clearInterval(interval);
                setInterval(function () {
                    if (debug) {
                        console.log("SENDING", connection.userid);
                    }
                    var context = canvas.toDataURL();
                    connection.send({
                        canvassend: true,
                        canvas: context
                    }, ownerid);
                }, 1000)
            }
        })
    }, 3000)
}

function CreateTopTooltip(data) {
    Object.keys(data).forEach(function (id) {
      var element = document.getElementById(id);
      element.addEventListener("mouseover", function (e) {
        document.getElementById("toptooltip").style.display = 'block';
        var tooltip = document.getElementById("toptooltip")
        tooltip.children[0].innerHTML = data[id];
        var x = e.target.x;
        var width = tooltip.getBoundingClientRect().width / 2;
        tooltip.style.left = e.target.getBoundingClientRect().x + (e.target.getBoundingClientRect().width / 2) - width + "px";
        element.addEventListener("mouseleave", function () {
          document.getElementById("toptooltip").style.display = 'none';
        })
      })
    });
  }