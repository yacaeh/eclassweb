class classroomManagerClass {
    constructor(){
        this.tooltips = [];
    }

    callTeacher() {
        connection.send({
            callTeacher: {
                userid: connection.userid
            }
        }, GetOwnerId());
    };

    windowFocusChecker() {
        window.focus();
        function sendFocus(state) {
            if (!connection.extra.roomOwner) {
                connection.send({
                    onFocus: {
                        userid: connection.userid,
                        focus: state
                    }
                }, GetOwnerId());
            }
        }

        var checkInterval = undefined;
        function focusCheck(e) {
            if (e.type == "blur") {
                classroomManager.removeToolTip();
                checkInterval = setTimeout(function () {
                    sendFocus(false);
                }, 100);
            }
            else if (e.type == "focus") {
                sendFocus(true);
                clearTimeout(checkInterval);
            }
        }

        $(GetWidgetFrame()).on("blur focus", focusCheck);
        $(window).on("blur focus", focusCheck);
    };
    
    resizeend() {
        if (new Date() - rtime < delta) {
            setTimeout(classroomManager.resizeend, delta);
        } else {
            timeout = false;
            classroomManager.canvasResize();
        }
    };

    canvasResize() {
        var frame = GetWidgetFrame();
        frame.window.resize();

        var canvas = frame.document.getElementById('main-canvas');
        var x = canvas.width;
        var y = canvas.height;
        var renderCanvas = frame.document.getElementById('renderCanvas');
        if (renderCanvas) {
            renderCanvas.style.left = "50px";
            renderCanvas.width = x;
            renderCanvas.height = y;
        }
        if (frame.document.getElementById("epub-viewer"))
            epubManager.EpubPositionSetting()
    };

    setTeacher() {
        let frame = GetWidgetFrame();
        document.getElementById("session-id").innerHTML = connection.extra.userFullName + " (" + params.sessionid + ")";
        $("#my-name").remove();
        $(".for_teacher").show();
        $(".controll").show();
        $(".feature").show();
        $(frame.document.getElementById("callteacher")).remove();
        $(frame.document.getElementById("homework")).remove();
    };

    setStudent() {
        document.getElementById("session-id").innerHTML = connection.extra.userFullName + " (" + params.sessionid + ")";
        $(".for_teacher").remove();
        $(".controll").remove();
        $(".feature").remove();
        $("#showcam").remove();
        $("#showcanvas").remove();
        $("#student_list").remove();

        let frame = GetWidgetFrame();
        $(frame.document.getElementById("3d_view")).remove();
        $(frame.document.getElementById("movie")).remove();
        $(frame.document.getElementById("file")).remove();
        $(frame.document.getElementById("epub")).remove();
    };

    gotoMain() {
        var href = location.protocol + "//" + location.host + "/dashboard/";
        window.open(href, "_self");
    };

    setTopToolTip(data) {
        Object.keys(data).forEach(function (id) {
            let element = document.getElementById(id);
            element.addEventListener("mouseover", function (e) {
                document.getElementById("toptooltip").style.display = 'block';
                let tooltip = document.getElementById("toptooltip")
                tooltip.children[0].innerHTML = data[id];
                let width = tooltip.getBoundingClientRect().width / 2;
                tooltip.style.left = e.target.getBoundingClientRect().x + (e.target.getBoundingClientRect().width / 2) - width + "px";
                element.addEventListener("mouseleave", function () {
                    document.getElementById("toptooltip").style.display = 'none';
                })
            })
        });
    };

    removeToolTip(){
        altdown = false;
        this.tooltips.forEach(element => GetWidgetFrame().document.getElementById("tool-box").removeChild(element));
        this.tooltips = [];
    };

    setShortCut(shortCut){
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
                            classroomManager.removeToolTip();
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
                    classroomManager.removeToolTip();
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
                classroomManager.tooltips.push(div);
                GetWidgetFrame().document.getElementById("tool-box").appendChild(div);
            });
        }
    }

    joinStudent(event) {
        document.getElementById("nos").innerHTML = connection.getAllParticipants().length;
        if (!connection.extra.roomOwner) return;

        ChattingManager.enterStudent(event);

        var id = event.userid;
        var name = event.extra.userFullName;

        var img = document.createElement("img");
        if (!classroomInfo.showcanvas)
            img.style.display = 'none';
        canvasManager.canvas_array[id] = img;
        var div = $(' <span data-id="' + id + '" data-name="' + name + '" class="student">\
              <span style="display:none;" class="permissions"></span> \
              <span class="student-overlay"></span> \
              <span class="bor"></span> \
              <span class="name">' + name + '</span></span>')
        OnClickStudent(div, id, name);

        div[0].addEventListener("mouseover", function () {
            if(classroomInfo.canvasPermission.includes(id))    
                return;

            connection.send({
                sendcanvasdata: true,
                state: true
            }, id)

            canvasManager.showingCanvasId = id;
        })

        div[0].addEventListener("mouseleave", function () {
            if (!classroomInfo.showcanvas)
                connection.send({
                    sendcanvasdata: true,
                    state: false
                }, id)

            if(!classroomInfo.canvasPermission.includes(id)) 
                canvasManager.clearStudentCanvas(id);

            canvasManager.showingCanvasId = undefined;
        })

        $("#student_list").append(div);

        this.studentListResize();
        canvasManager.canvas_array[id] = img;
        $(div).append(img);
    };

    leftStudent(event){
        document.getElementById("nos").innerHTML = connection.getAllParticipants().length;
  
        if(event.userid == GetOwnerId()){
          connection.socket._callbacks.$disconnect.length = 0
          connection.socket.disconnect();
          alertBox("선생님이 나갔습니다. 이전 화면으로 돌아갑니다","알림", classroomManager.gotoMain, "확인")
        }
      
        if (!connection.extra.roomOwner) return;
      
        let id = event.userid;
        let name = event.extra.userFullName;
      
        if (id == classroomInfo.classPermission)
          classroomInfo.classPermission = undefined;
      
        if (id == classroomInfo.micPermission)
          classroomInfo.micPermission = undefined;
        
        if (permissionManager.IsCanvasPermission(id))
        permissionManager.DeleteCanvasPermission(id);
        
        let childern = document.getElementById("student_list").children;
        for (let i = 0; i < childern.length; i++) {
          let child = childern[i];
          if (child.dataset.id == id) {
            document.getElementById("student_list").removeChild(child);
            delete canvasManager.canvas_array[id];
            console.log("EXIT ROOM", id, name);
            ChattingManager.leftStudent(event);
            break;
          }
        }
      
        this.studentListResize();
    };

    studentListResize(){
        let btn = document.getElementById("student_list_button")
        let list = document.getElementById("student_list");
        let len = list.children.length - 1;
        let on = btn.classList.contains("on");
        
        if(on && len != 16)
          len++;
        let line = Math.ceil(len / 4);
      
        if(on){
          line = Math.max(4,line);
          $(list).css({
            gridAutoRows : 100 / line + "%",
            height : 6 * line + "%"
          })
        }
        else{
          btn.innerHTML = "+" + (len - 15);
          $(list).css({
            gridAutoRows : 100 / 4 + "%",
            height : 6 * 4 + "%"
          })
        }
      
        if(line <= 4){
          Hide(btn);
        }
        else if(line >= 5){
          if(!on)
            list.insertBefore(btn, list.children[16])
          else 
            list.appendChild(btn)
      
          btn.style.display = "inline-block";
        }
    };

    toggleViewType(){
        $('.view_type').click(function () {
            $('.view_type').removeClass('view_type-on');
            $(this).addClass('view_type-on');
        
            switch (this.id) {
              // 학생 판서
              case 'top_student':
                var childern = document.getElementById("student_list").children;
                classroomInfo.showcanvas = true;
                for (var i = 0; i < childern.length; i++) {
                  Show(childern[i].getElementsByTagName("img")[0]);
                  Hide(childern[i].getElementsByTagName("video")[0]);
                }
                $('#student_list').show();
                connection.send({
                  sendcanvasdata : true,
                  state : true
                })
                break;
        
              //학생 캠
              case 'top_camera':
                var childern = document.getElementById("student_list").children;
                classroomInfo.showcanvas = false;
                for (var i = 0; i < childern.length; i++) {
                  Show(childern[i].getElementsByTagName("video")[0]);
                  Hide(childern[i].getElementsByTagName("img")[0]);
                }
                connection.send({
                  sendcanvasdata : true,
                  state : false
                })
                break;
            }
          });
    }
}