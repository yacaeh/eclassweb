class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nowView : 'student-cam'
        }

        this.Features = this.Features.bind(this);
        this.cameraBtnHandler = this.cameraBtnHandler.bind(this);
        this.studentBtnHandler = this.studentBtnHandler.bind(this);
    }

    Features() {
        return <span className="feature">
            <img className="divide" />
            <CameraBtn onClick={this.cameraBtnHandler} />
            <StudentBtn onClick={this.studentBtnHandler} />
            <SaveNotification />
            <ScreenRecorder />
        </span>
    }


    cameraBtnHandler(e) {
        $('.view_type').removeClass('view_type-on');
        e.target.classList.add('view_type-on');
        classroomInfo.showcanvas = false;
        let childern = document.getElementById("student_list").children;

        if(e.target.classList.contains('view_type-on')){
            e.target.classList.toggle('vstudent');
        }
        
        if(!e.target.classList.contains('vstudent')){
            for (let i = 0; i < childern.length; i++) {
                Show(childern[i].getElementsByTagName("video")[0]);
                Hide(childern[i].getElementsByTagName("img")[0]);
            }
            connection.send({
                sendcanvasdata: true,
                state: false
            })
            maincamManager.hide();
        }
        else{
            for (let i = 0; i < childern.length; i++) {
                Hide(childern[i].getElementsByTagName("video")[0]);
            }
            maincamManager.show();
        }
        classroomManager.updateClassroomInfo();
    };

    studentBtnHandler(e) {
        $('.view_type').removeClass('view_type-on');
        e.target.classList.add('view_type-on');
        let childern = document.getElementById("student_list").children;
        classroomInfo.showcanvas = true;
        for (let i = 0; i < childern.length; i++) {
            Show(childern[i].getElementsByTagName("img")[0]);
            Hide(childern[i].getElementsByTagName("video")[0]);
        }
        $('#student_list').show();
        connection.send({
            sendcanvasdata: true,
            state: true
        })
        classroomManager.updateClassroomInfo();
    };

    render() {
        return (
            <>
                <header id="header">
                    <ToolTip />
                    <img id="icon_exit" onClick={this.exitRoom} />
                    <span id="my-name" />
                    <span id="session-id" />

                    <img id="student_isallcontrol" src="/dashboard/img/lock.png" />
                    <img className="permission-icon" id="student_screenshare"/>
                    <img className="permission-icon" id="student_canvas"/>
                    <img className="permission-icon" id="student_mic"/>

                    <div className="icons">
                        <span className="controll">
                            <AllControll />
                            <ExamIcon />
                            <Attention />
                        </span>
                        <LanguageSelector />
                    </div>

                    <this.Features />
                    <CurrentTime />
                </header>
            </>
        )
    };

    exitRoom() {
        alertBox($.i18n('EXIT_CONFIRM'), $.i18n('WARNING'), () => {
            if (connection.extra.roomOwner) {
                connection.send({ roomBoom: true })
            }
            classroomManager.gotoMain();
        },
            function () { }
        );
    }
}

function ToolTip() {
    return <div id="toptooltip">
        <span className="text"></span>
        <span className="sq"> </span>
    </div>
}

class CurrentTime extends React.Component {
    render() {
        return <span className="time">
            <span id="current-time" />
            <span id="recording-time">
                <img src="/dashboard/img/recording.png" style={{ display: 'none', marginRight: '7px', marginBottom: '2px' }} />
                <span className="text">0:00:00</span>
            </span>
        </span>
    }
}

function CameraBtn(props) {
    return <img onClick={props.onClick} className="top_icon view_type-on view_type" id="top_camera" />
}

function StudentBtn(props) {
    return <img onClick={props.onClick} className="top_icon view_type" id="top_student" />
}
