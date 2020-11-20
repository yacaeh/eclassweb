var classroomInfo = {};

classroomCommand = {
    joinRoom: function (_info) {
        console.debug("Synced classroom info");
        let action = {type : SET_CLASSROOM_INFO, data : _info};
        store.dispatch(action);
        classroomInfo = _info;
        onSocketConnected();
    },

    updateSyncRoom: function () {
        reactEvent.allControl(classroomInfo.allControl);

        if (classroomInfo.share3D.state) {
            sync3DModel();
            onBtn("3d_view");
        }

        if (classroomInfo.epub.state) {
            classroomCommand.openEpub(classroomInfo.epub.url);
            onBtn("epub");
        }

        if (classroomInfo.viewer.state) {
            if(classroomInfo.allControl)
            mfileViewer.syncViewer();
            pageNavigator.allControl(classroomInfo.allControl);
            onBtn("file");
        }

        if (classroomInfo.showcanvas) {
            canvasManager.sendMyCanvas = true;
        }

        if (classroomInfo.movierender.state) {
            let data = classroomInfo.movierender;
            OnMovieRender(data.state, data.type, data.url);
            onBtn("movie");

            if (connection.extra.roomOwner) {
                isSharingMovie = true;
                urlform.style.display = "inline-block";
            }
        }

        if (classroomInfo.exam.state) {
            examObj.rejoin();
        }

        if (connection.extra.roomOwner) {
            let list = document.getElementById("student_list");
            let students = list.getElementsByClassName("student");


            for (let i = 0; i < students.length; i++) {
                let student = students[i];
                let id = student.dataset.id;

                if (classroomInfo.permissions.classPermission == id) {
                    FindInList(id).dataset.classPermission = true;
                    MakeIcon(id, "screen");
                }

                if (classroomInfo.permissions.micPermission == id) {
                    FindInList(id).dataset.micPermission = true;
                    MakeIcon(id, "mic");
                }

                if (classroomInfo.permissions.canvasPermission.includes(id)) {
                    FindInList(id).dataset.canvasPermission = true;
                    MakeIcon(id, "canvas");
                }
            }
        }
    },
};

function onBtn(id) {
    let btn = document.getElementById(id);
    if (btn)
        btn.classList.add("selected-shape")
}

classroomCommand.receivAlert = function () {
    var alertTimeHandler;
    alertBox("<progress max='100' value='100' class='alert-progress exam-state-progress'></progress>", window.langlist.NOTIFICATION, () => {
        response('yes');
    }, () => {
        response('no');
    });

    alertTimeHandler = setTimeout(noResponse, 5000);
    decreaseProgress = setInterval(function () {
        var progressVal = $(".alert-progress").val() - (10 / 5000 * 100);
        $(".alert-progress").val(progressVal)
    }, 10);

    function response(yesOrno) {
        connection.send({
            alertResponse: {
                userid: connection.userid,
                name: params.userFullName,
                response: yesOrno
            }
        });
        clearInterval(decreaseProgress);
        clearTimeout(alertTimeHandler);
    }

    function noResponse() {
        clearInterval(decreaseProgress);
        clearTimeout(alertTimeHandler);
        $('#alert-box').fadeOut(300);
    };
};

// 학생이 선생님에게 내가 다른곳을 보고 있다고 보고한다.
classroomCommand.receivedOnFocusResponse = (_response) => {
    if (connection.extra.roomOwner) {
        let userId = _response.userId;
        let boolOnFocus = _response.onFocus;
        let children = document.getElementById("student_list").children;

        for (let i = 0; i < children.length; i++) {
            if (children[i].dataset.id == userId) {
                let student_overlay = $(`[data-id='${userId}'] > .student-overlay`);
                boolOnFocus ? student_overlay.css('background', 'none') : student_overlay.css('background', 'black');
            }
        };
    }
};

// 학생이 선생님에게 권한 요청을 한다.
classroomCommand.receivedCallTeacherResponse = (userId) => {
    if (connection.extra.roomOwner) {
        let children = document.getElementById("student_list").children;

        for (let i = 0; i < children.length; i++) {
            if (children[i].dataset.id == userId) {
                console.log("Received Call Teacher Respose : " + userId);

                let student_overlay;
                let isMeCount = 5;
                let flickerInterval = setInterval(function () {
                    student_overlay = $(`[data-id='${userId}'] > .student-overlay`);
                    let initBackColor = student_overlay.css('background');
                    let orangeColor = setOverlayColor('orange');
                    setTimeout(function () {
                        student_overlay = $(`[data-id='${userId}'] > .student-overlay`);
                        let initBackColor2 = student_overlay.css('background');
                        if (orangeColor !== initBackColor2)
                            initBackColor = initBackColor2
                        setOverlayColor(initBackColor);
                    }, 500);
                    if (isMeCount-- <= 0)
                        clearInterval(flickerInterval);
                }, 1000);

                function setOverlayColor(overlayColor) {
                    student_overlay.css('background', overlayColor);
                    return student_overlay.css('background');
                }
            }
        };
    }
};

// 학생이 응답했을 때, 선생님 처리 부분
classroomCommand.receiveAlertResponse = function (_response) {
    if (connection.extra.roomOwner) {
        const userId = _response.userid;
        const response = _response.response;

        let chilldren = document.getElementById("student_list").children;

        for (let i = 0; i < chilldren.length; i++) {
            if (chilldren[i].dataset.id == userId) {
                let al = chilldren[i].getElementsByClassName("bor")[0];
                al.className = "";
                al.classList.add("bor");
                response == "yes" ? al.classList.add("alert_yes") : al.classList.add("alert_no");
            }
        }
    }
}

classroomCommand.sendOpenEpub = function (url) {
    classroomInfo.epub.state = true;
    classroomInfo.epub.url = url;
    connection.send({
        epub    : classroomInfo.epub,
        start   : classroomInfo.epub.start,
        end     : classroomInfo.epub.end,
        url
    });
    classroomManager.updateClassroomInfo();
};

classroomCommand.sendCloseEpub = function () {
    classroomInfo.epub.state = false;
    connection.send({ epub: { state: false } });
    classroomManager.updateClassroomInfo();
};

classroomCommand.openEpub = function (url) {
    if (classroomInfo.epub.state) {
        if (epubManager.renditionBuffer) {
            if (classroomInfo.allControl)
                epubManager.renditionBuffer.display(classroomInfo.epub.page);
        }
    }
    else {
        epubManager.loadEpubViewer(url);
    }

    if (!connection.extra.roomOwner) {
        if (classroomInfo.allControl) {
            if (classroomInfo.epub.state) {
                Hide('next')
                Hide('prev')
                Hide('lnext')
                Hide('lprev')
                let thumbnails = document.getElementsByClassName('thumbnail');
                for(let i = 0 ; i < thumbnails.length; i++){
                    thumbnails[i].style.pointerEvents = 'none';
                }
            }
        }
        else {
            if (classroomInfo.epub.state) {
                Show('next')
                Show('prev')
                Show('lnext')
                Show('lprev')
                let thumbnails = document.getElementsByClassName('thumbnail');
                for(let i = 0 ; i < thumbnails.length; i++){
                    thumbnails[i].style.pointerEvents = '';
                }
            }
        }

    }
};


classroomCommand.sendEpubCmd = function (_cmd, _data) {
    if (!connection.extra.roomOwner) return;
    if (classroomInfo.epub.page == _data.page) return;

    classroomInfo.epub.page = _data.page;
    classroomManager.updateClassroomInfo();

    if (!classroomInfo.allControl) return;

    console.log(_data);
    connection.send({
        epub: {
            cmd: _cmd,
            data: _data
        }
    });
}

classroomCommand.updateEpubCmd = function (_data) {
    let frame = GetWidgetFrame();
    let epubViewer = frame.document.getElementById('epub-viewer');

    if (!epubViewer) return;
    switch (_data.cmd) {
        case 'page':
            let page = _data.data.page;
            if (classroomInfo.epub.page != page) {
                classroomInfo.epub.page = page;
                if (epubManager.renditionBuffer) {
                    epubManager.renditionBuffer.display(page);
                }
            }
            break;
        case 'next':
            document.getElementById('next').click();
            break;
        case 'prev':
            document.getElementById('prev').click();
            break;
    }
}
