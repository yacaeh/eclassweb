class classroomManagerClass {
    constructor() {
        this.tooltips = [];
        this.altdown = false;
    }
    init(shortCut, topButtonContents) {
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


    }

    callTeacher() {
        connection.send({ callTeacher: { userid: connection.userid } }, GetOwnerId());
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

        let checkInterval = undefined;
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
        let frame = GetWidgetFrame();
        frame.window.resize();

        let canvas = frame.document.getElementById('main-canvas');
        let x = canvas.width;
        let y = canvas.height;
        let renderCanvas = frame.document.getElementById('renderCanvas');
        if (renderCanvas) {
            renderCanvas.width = x;
            renderCanvas.height = y;
        }
    };

    gotoMain() {
        window.open(location.protocol + "//" + location.host + "/dashboard/", "_self");
    };

    setTopToolTip(data) {
        let tooltip = document.getElementById("toptooltip");
        Object.keys(data).forEach(function (id) {
            let element = document.getElementById(id);
            if (element)
                element.addEventListener("mouseover", function (e) {
                    tooltip.style.display = 'block';
                    tooltip.children[0].innerHTML = data[id];
                    let width = tooltip.getBoundingClientRect().width / 2;
                    tooltip.style.left = e.target.getBoundingClientRect().x + (e.target.getBoundingClientRect().width / 2) - width + "px";
                    element.addEventListener("mouseleave", function () {
                        tooltip.style.display = 'none';
                    })
                })
        });
    };

    removeToolTip() {
        classroomManager.altdown = false;
        this.tooltips.forEach(element => document.getElementById("tool-box").removeChild(element));
        this.tooltips = [];
    };

    setShortCut(shortCut) {
        window.addEventListener('keydown', down);
        GetWidgetFrame().addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        GetWidgetFrame().addEventListener('keyup', up);

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
                            document.getElementById(Object.keys(cut)).click();
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
                let btn = document.getElementById(Object.keys(cut));
                if (!btn) return false;
                let top = btn.getBoundingClientRect().top;
                let div = document.createElement("div");
                div.className = "tooltips";
                div.innerHTML = Object.values(cut)[0];
                div.style.top = top - 30 + 'px';
                classroomManager.tooltips.push(div);
                document.getElementById("tool-box").appendChild(div);
            });
        }
    }

    createRoom() {
        console.debug('Opening Class!');
        connection.open(params.sessionid, function (isRoomOpened, roomid, command, _info) {
            if (command == "room already exist" && !connection.byLogin) {
                console.log("EXISTING_ROOM_ERROR");
                alert(window.langlist.EXISTING_ROOM_ERROR);
                classroomManager.gotoMain();
            }
            else if(connection.byLogin == true){
                console.log("join room teacher")
                classroomCommand.joinRoom(_info);

                connection.join({
                    sessionid: params.sessionid,
                    userid: connection.userid,
                    session: connection.session
                }, function (a, b, c) {
                    connection.socket.on('disconnect', () => location.reload())
                })
            }
            else if (command == "owner rejoin") {
                classroomCommand.joinRoom(_info);
                connection.join({
                    sessionid: params.sessionid,
                    userid: connection.channel,
                    session: connection.session
                }, function (a, b, c) {
                    connection.socket.on('disconnect', () => location.reload())
                })
            }
            else {
                classroomCommand.joinRoom(_info);
                connection.socket.on('disconnect', () => location.reload())
            }
        });

    };

    joinRoom() {
        connection.join({
            sessionid: params.sessionid,
            userid: connection.channel,
            session: connection.session
        }, function (isRoomJoined, error, roominfo) {
            if (error) {
                console.log('Joing Error!', error);
                if (error === connection.errors.ROOM_NOT_AVAILABLE) {
                    alert("방이 존재하지 않습니다");
                    location.reload();
                    return;
                }
                if (error === connection.errors.ROOM_FULL) {
                    alert(window.langlist.FULL_ROOM_ERROR);
                    classroomManager.gotoMain();
                    return;
                }
                if (error === connection.errors.INVALID_PASSWORD) {
                    connection.password = prompt('Please enter room password.') || '';
                    if (!connection.password.length) {
                        alert('Invalid password.');
                        return;
                    }
                    connection.join(params.sessionid, function (isRoomJoined, roominfo,error) {
                        if (error) {
                            console.log(error);
                        }
                    });
                    return;
                }
            }

            classroomCommand.joinRoom(roominfo);
            connection.socket.on('disconnect', function () {
                console.log('disconnect Class!');
                location.reload();
            });
        }
        );
    }

    eventListener(event) {
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

        if (event.data.roomBoom) {
            connection.socket._callbacks.$disconnect.length = 0;
            connection.socket.disconnect();
            alertBox(window.langlist.TEACHER_LEFT, window.langlist.NOTIFICATION, classroomManager.gotoMain, window.langlist.CONFIRM)

            return true;
        }
    };

    leftTeacher() {
        canvasManager.clearTeacherCanvas();

        if(!examObj.isStart)
            examObj.closeBoard();
        console.debug("Teacher left the class");
    };

    rejoinTeacher() {
        console.debug("teacher rejoin");
    };

    updateClassroomInfo(callback) {
        connection.socket.emit("update-room-info", Object.assign({}, classroomInfo), callback);
    };
}
