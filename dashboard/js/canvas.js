/*
    캔버스, 판서 관련
*/

class canvasManagerClass {
    constructor() {
        this.sendMyCanvas = false;
        this.showingCanvasId = undefined;
        this.canvas_array = {};
        this.canvas = undefined;

    }

    init() {
        this.canvas = GetWidgetFrame().document.getElementById("main-canvas");
        this.sendCanvasDataToOwner();
    };

    clear() {
        this.clearCanvas();
        this.clearStudentCanvas();
        this.clearTeacherCanvas();
    };
    clearCanvas() {
        designer.syncData({
            command: "clearcanvas",
            uid: connection.userid,
        })
    };
    clearStudentCanvas(studentid) {
        designer.syncData({
            command: "clearstudent",
            isStudent: true,
            userid: studentid,
        })
    };
    clearTeacherCanvas() {
        designer.syncData({
            command: "clearteacher",
            uid: connection.userid,
        })
    };
    setCanvasButtons(data) {
        Object.keys(data).forEach(function (e) {
            let btn = document.getElementById(e);
            if (btn)
                btn.addEventListener("click", function () {
                    data[e](btn);
                })
        })
    };
    eventListener(event) {
        if (event.data.sendcanvasdata) {
            this.sendMyCanvas = event.data.state;
            canvasManager.sendCanvasDataToOwnerOneTime();
            return true;
        };

        if (event.data.canvassend) {
            let img = event.data.image;
            event.data.image = undefined;
            this.canvas_array[event.userid].src = img;
            if (event.userid == this.showingCanvasId) {
                // canvasManager.clearStudentCanvas(event.userid);
                designer.syncData(event.data);
            }
            return true;
        };

        if (event.data.sendStudentPoint) {
            event.data.command = "default";
            designer.syncData(event.data);
            return true;
        };

        if (event.data.getpointer) {
            pointer_saver.send(event.data.idx);
            return true;
          }
        
          if (event.data.setpointer) {
            if (event.data.idx == "empty")
              return true;
        
            event.data.data.command = "load";
        
            if (event.extra.roomOwner && !connection.extra.roomOwner) {
              if (pointer_saver.nowIdx == event.data.idx)
                designer.syncData(event.data.data);
            }
            else {
              event.data.data.isStudent = true;
              if (pointer_saver.nowIdx == event.data.idx)
                designer.syncData(event.data.data);
            }
            return true;
          }

    };
    sendCanvasDataToOwner() {
        if (connection.extra.roomOwner) return;
        
        setInterval(function () {
            if (canvasManager.sendMyCanvas) {
                canvasManager.sendCanvasDataToOwnerOneTime();
            }
        }, 1000)
    };
    sendCanvasDataToOwnerOneTime() {
        let canvas = this.canvas;
        let newcanvas = document.createElement("canvas");
        let width = Math.max(canvas.width / 4, 480);
        let height = Math.max(canvas.width / 4, 380)
        let newctx = newcanvas.getContext("2d");

        newcanvas.width = width;
        newcanvas.height = height;

        newctx.fillStyle = "#FFFFFF";
        newctx.fillRect(0, 0, newcanvas.width, newcanvas.height);
        newctx.drawImage(canvas, 0, 0, newcanvas.width, newcanvas.height);

        connection.send({
            canvassend: true,
            isStudent: true,
            points: currentPoints,
            history: currentHistory,
            userid: connection.userid,
            image: newcanvas.toDataURL('image/jpeg', 0.000001)
        }, GetOwnerId())
    };
}

var designer = new CanvasDesigner();

designer.widgetHtmlURL          = './widget.html';
designer.widgetJsURL            = './js/widget.js';
designer.icons.on               = '/dashboard/img/view_on.png';
designer.icons.off              = '/dashboard/img/view_off.png';

designer.addSyncListener(function (data) {
    var isStudent = permissionManager.IsCanvasPermission(data.userid);
    if (connection.extra.roomOwner || isStudent) {
        data.isStudent = isStudent;
        connection.send(data);
    }
});

function checkSharing() {
    return classroomInfo.shareScreen.state ||
        classroomInfo.share3D.state ||
        isSharingMovie ||
        isSharingFile ||
        isSharingEpub;
}

function removeOnSelect(btn) {
    if (!connection.extra.roomOwner) {
        alert($.i18n('TEACHER_USING_FEATURE'))
        return;
    }

    if(classroomInfo.shareScreen.state && connection.userid != classroomInfo.shareScreen.userid){
        alert($.i18n('SOMEONE_USING_SCREEN'));
        btn.classList.remove("on");
        btn.classList.remove("selected-shape");
        return;
    }

    alertBox($.i18n('ASK_CLOSE_CURRENT'), $.i18n('NOTIFICATION'), function () {
        if (classroomInfo.share3D.state) {
            document.getElementById("3d_view").click();
            classroomInfo.share3D.state = false;
        }

        if (classroomInfo.shareScreen.state) {
            document.getElementById("screen_share").click();
        }

        if (isSharingMovie) {
            document.getElementById("movie").click();
            isSharingMovie = false;
        }

        if (isSharingFile) {
            unloadFileViewer();
            isSharingFile = false;
        }

        if (isSharingEpub) {
            document.getElementById("epub").click();
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

