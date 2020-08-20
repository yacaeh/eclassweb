/*
    캔버스, 판서 관련
*/

class CanvasManagerClass {
    clear(){
        this.clearCanvas();
        this.clearStudentCanvas();
        this.clearTeacherCanvas();
    }
    clearCanvas() {
        designer.syncData({
            command: "clearcanvas",
            uid: connection.userid,
        })
    }
    clearStudentCanvas(studentid) {
        designer.syncData({
            command: "clearstudent",
            isStudent: true,
            userid: studentid,
        })
    }
    clearTeacherCanvas() {
        designer.syncData({
            command: "clearteacher",
            uid: connection.userid,
        })
    }
}

var canvas;
var ctx;
var tooltips = [];
var altdown = false;
var designer            = new CanvasDesigner();

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
    var isStudent = permissionManager.IsCanvasPermission(data.userid);
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
    rectangle: false,
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
    if (!connection.extra.roomOwner) {
        alert("선생님이 다른 기능을 사용 중 입니다")
        return;
    }

    if (classroomInfoLocal.shareScreenByStudent) {
        alert("학생이 화면 공유 중 입니다.");
        btn.classList.remove("on");
        btn.classList.remove("selected-shape");
        return;
    }

    alertBox("현재 기능을 종료합니까?", "알림", function () {
        if (classroomInfo.share3D.state) {
            GetWidgetFrame().document.getElementById("3d_view").click();
            classroomInfo.share3D.state = false;
        }

        if (classroomInfo.shareScreen.state) {
            GetWidgetFrame().document.getElementById("screen_share").click();
            classroomInfo.shareScreen.state = false;
        }

        if (isSharingMovie) {
            GetWidgetFrame().document.getElementById("movie").click();
            isSharingMovie = false;
        }

        if (isSharingFile) {
            unloadFileViewer();
            isSharingFile = false;
        }

        if (isSharingEpub) {
            GetWidgetFrame().document.getElementById("epub").click();
            isSharingEpub = false;
        }

        setTimeout(function () {
            btn.classList.remove("on");
            btn.classList.remove("selected-shape");
            btn.click();
        }, 50)
    },
        function () {
            btn.classList.remove("on");
            btn.classList.remove("selected-shape");
        })
}

function SendCanvasDataToOwner() {
    if (connection.extra.roomOwner)
        return;
    setInterval(function () {
        if (sendMyCanvas) {
            SendCanvasDataToOwnerOneTime();
        }
    }, 1000)
}

function SendCanvasDataToOwnerOneTime() {
    var newcanvas = document.createElement("canvas");
    var width = Math.max(canvas.width / 4, 480);
    var height = Math.max(canvas.width / 4, 380)
    newcanvas.width = width;
    newcanvas.height = height;

    var newctx = newcanvas.getContext("2d");
    newctx.drawImage(canvas, 0, 0, newcanvas.width, newcanvas.height);

    var data = newcanvas.toDataURL();

    connection.send({
        canvassend: true,
        canvas: data
    }, GetOwnerId());

    if (debug) {
        console.log(data)
        console.log("SENDING", connection.userid);
    }
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

function SetShortcut(shortCut) {

    $(GetWidgetFrame()).on("keydown", down);
    $(window).on("keydown", down);

    $(GetWidgetFrame()).on("keyup", up);
    $(window).on("keyup", up);


    function down(key) {
        if (key.altKey) {
            if (!altdown) {
                MakeTooltip(shortCut);
                altdown = true;
            }
            key.preventDefault();

            shortCut.forEach(function (cut) {
                if (key.key == Object.values(cut)) {
                    if (Object.keys(cut) == "screen_share") {
                        RemoveTooltip();
                        altdown = false;
                    }
                    try {
                        GetWidgetFrame().document.getElementById(Object.keys(cut)).click();
                    }
                    catch{
                    }
                }
            });

        }
    }

    function up(key) {
        if (key.key == "Alt") {
            if (altdown) {
                RemoveTooltip();
                altdown = false;
            }
        }
    }

    function MakeTooltip(shortcut) {
        shortcut.forEach(function (cut) {
            var btn = GetWidgetFrame().document.getElementById(Object.keys(cut));
            if (!btn)
                return false;

            var top = btn.getBoundingClientRect().top;
            var div = GetWidgetFrame().document.createElement("div");
            div.className = "tooltip";
            div.innerHTML = Object.values(cut)[0];
            div.style.top = top + 15 + 'px';
            tooltips.push(div);
            GetWidgetFrame().document.getElementById("tool-box").appendChild(div);
        });
    }
}

function RemoveTooltip() {
    altdown = false;
    tooltips.forEach(element => GetWidgetFrame().document.getElementById("tool-box").removeChild(element));
    tooltips = [];
}

function canvasinit() {
    canvas = GetWidgetFrame().document.getElementById('main-canvas');
    ctx = canvas.getContext('2d');
}