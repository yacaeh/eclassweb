/*
    캔버스, 판서 관련
*/
var designer = new CanvasDesigner();

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
        classroomInfo.epub.state;
}

function removeOnSelect(btn) {
    if (!connection.extra.roomOwner) {
        alert(window.langlist.TEACHER_USING_FEATURE)
        return;
    }

    if(classroomInfo.shareScreen.state && connection.userid != classroomInfo.shareScreen.userid){
        alert(window.langlist.SOMEONE_USING_SCREEN);
        btn.classList.remove("on");
        btn.classList.remove("selected-shape");
        return;
    }

    reactEvent.AlertBox({
        title : window.langlist.NOTIFICATION,
        content : window.langlist.ASK_CLOSE_CURRENT,
        yes : function () {
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
                document.getElementById("btn-confirm-file-close").click();
                isSharingFile = false;
            }
    
            if (classroomInfo.epub.state) {
                document.getElementById("btn-confirm-file-close").click();
                isSharingFile = false;
            }
    
            setTimeout(function () {
                btn.classList.remove("on");
                btn.classList.remove("selected-shape");
                btn.click();
            }, 50)
        },

        no : function () {
            btn.classList.remove("on");
            btn.classList.remove("selected-shape");
        }
    })
}

