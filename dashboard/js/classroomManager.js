class classroomManagerClass {
    constructor(){
        this.tooltips = [];
        this.altdown = false;
    }
    init(shortCut, topButtonContents){
        this.toggleViewType();
        this.windowFocusChecker();
        this.setShortCut(shortCut);
        this.setTopToolTip(topButtonContents);
        
        window.addEventListener('resize', function () {
            rtime = new Date();
            if (timeout === false) {
              timeout = true;
              setTimeout(classroomManager.resizeend, delta);
            }
        });

        _AllCantrallFunc();
        AddEvent("confirm-title", "click", ViewUploadList);
        AddEvent("confirm-title2", "click", ViewHomeworkList);
        AddEvent("icon_exit", "click", () => alertBox("정말로 나가시겠습니까?", "경고", classroomManager.gotoMain, function () { }))
        AddEvent("top_save_alert", "click", attentionManager.exportAttention);
        AddEvent("top_alert", "click", attentionManager.callAttend);
        AddEvent("top_record_video", "click", (self) => {
            if (!self.classList.contains("on")) {
                screenRecorder._startCapturing();
            }
            else {
                screenRecorder._stopCapturing();
                self.classList.remove("on");
            }
        })

        AddEvent("student_list_button", "click", (self) => {
            let on = self.classList.contains("on");
            let list = document.getElementById("student_list");
            let len = list.children.length;
            let line = Math.ceil(len / 4);

            if (!on) {
                list.appendChild(self);
                line = Math.max(4, line);
                self.innerHTML = "…";
            }
            else {
                self.innerHTML = "+" + (len - 16);
                list.insertBefore(self, list.children[15]);
                line = 4;
            }

            $(list).css({
                gridAutoRows: 100 / line + "%",
                height: 6 * line + "%"
            })
            self.classList.toggle("on");
        })
        AddEvent("right-tab-collapse", "click", (self) => {
            self.classList.toggle("off");

            if (self.classList.contains("off")) {
                self.style.transform = "rotate(90deg)";
                $(".right-tab").animate({ width: "0%" })
                $("#widget-container").animate({ right: "0%" },
                    classroomManager.canvasResize)
            }
            else {
                self.style.transform = "rotate(-90deg)";
                $(".right-tab").animate({ width: "17.7%" })
                $("#widget-container").animate({ right: "17.7%" },
                    classroomManager.canvasResize)
            }
        })
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
        connection.extra.roomOwner = true;

        let frame = GetWidgetFrame();
        document.getElementById("session-id").innerHTML = connection.extra.userFullName + " (" + params.sessionid + ")";
        $("#my-name").remove();
        $(".feature").show();
        $(".controll").show();
        $(".for_teacher").show();
        $(frame.document.getElementById("callteacher")).remove();
        $(frame.document.getElementById("homework")).remove();
    };

    setStudent() {
        document.getElementById("session-id").innerHTML = connection.extra.userFullName + " (" + params.sessionid + ")";
        $(".feature").remove();
        $("#showcam").remove();
        $(".controll").remove();
        $("#showcanvas").remove();
        $(".for_teacher").remove();
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
            if(element)
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
        classroomManager.altdown = false;
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
                if (!classroomManager.altdown) {
                    MakeTooltip(shortCut);
                    classroomManager.altdown = true;
                }
                key.preventDefault();
    
                shortCut.forEach(function (cut) {
                    if (key.key == Object.values(cut)) {
                        if (Object.keys(cut) == "screen_share") {
                            classroomManager.removeToolTip();
                            classroomManager.altdown = false;
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
                if (classroomManager.altdown) {
                    classroomManager.removeToolTip();
                    classroomManager.altdown = false;
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
        classroomCommand.onConnectionSession(event);
        connection.send('plz-sync-points', event.userid);
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
    };

    createRoom(){
        console.log('Opening Class!');
        classroomManager.setTeacher();
        connection.open(params.sessionid, function (isRoomOpened, roomid, error) {
            if (!isRoomOpened) {
                alert("이미 존재하는 방입니다.");
                classroomManager.gotoMain();
            }
            else if (error) {
                connection.rejoin(params.sessionid);
            }
            else {
                classroomCommand.joinRoom();
                connection.socket.on('disconnect', () => location.reload())
            }
        });
    };

    joinRoom(){
        classroomManager.setStudent();

        console.log('try joining!');
    
        connection.join({
            sessionid: params.sessionid,
            userid: connection.channel,
            session: connection.session
        }, function (isRoomJoined, roomid, error) {
            console.log('Joing Class!');
    
            if (error) {
              console.log('Joing Error!');
              if (error === connection.errors.ROOM_NOT_AVAILABLE) {
                // alert("방이 존재하지 않습니다.");
                location.reload();
                return;
              }
              if (error === connection.errors.ROOM_FULL) {
                alert("방이 가득 찼습니다.");
                classroomManager.gotoMain();
                return;
              }
              if (error === connection.errors.INVALID_PASSWORD) {
                connection.password = prompt('Please enter room password.') || '';
                if (!connection.password.length) {
                  alert('Invalid password.');
                  return;
                }
                connection.join(params.sessionid, function (
                  isRoomJoined,
                  roomid,
                  error
                ) {
                  if (error) {
                    alert(error);
                  }
                });
                return;
              }
              alert(error);
            }
            
            connection.socket.on('disconnect', function () {
              console.log('disconnect Class!');
              location.reload();
            });

            console.log('isRoomJoined', isRoomJoined);
          }
        );
    }

    eventListener(event){
        if (event.data.onFocus) {
            classroomCommand.receivedOnFocusResponse({ 
              userId: event.data.onFocus.userid, 
              onFocus: event.data.onFocus.focus 
            });
          return true;
        }

        if (event.data.callTeacher) {
            classroomCommand.receivedCallTeacherResponse(event.data.callTeacher.userid);
          return true;
        }
    };

}