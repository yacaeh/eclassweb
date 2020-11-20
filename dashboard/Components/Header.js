class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nowView: 'STUDENT_CAM',
            isAllContorl: false
        }

        this.Features = this.Features.bind(this);
        this.cameraBtnHandler = this.cameraBtnHandler.bind(this);
        this.studentBtnHandler = this.studentBtnHandler.bind(this);
    }

    Features() {
        return <span className="feature">
            <AllControll />
            <ExamIcon />
            <Attention />
            <img className="divide" />
            <CameraBtn nowView={this.state.nowView} onClick={this.cameraBtnHandler} />
            <StudentBtn nowView={this.state.nowView} onClick={this.studentBtnHandler} />
            <SaveNotification />
            <ScreenRecorder />
        </span>
    }

    componentDidMount() {
        reactEvent.allControl = (e) => {
            classroomInfo.allControl = e;
            this.setState({ isAllContorl: e })
        }
    }

    cameraBtnHandler(e) {
        let nextState = '';

        if (this.state.nowView == "STUDENT_CAM") {
            nextState = "TEACHER_CAM";
        }
        else {
            nextState = "STUDENT_CAM";
        }

        this.setState({ nowView: nextState })
        store.dispatch({type : CHANGE_CAMVIEW, data : nextState });

        classroomInfo.showcanvas = false;
        let childern = document.getElementById("student_list").children;

        switch (nextState) {
            case "TEACHER_CAM":
                maincamManager.show();
                break;
            case "STUDENT_CAM":
                for (let i = 0; i < childern.length; i++) {
                    Show(childern[i].getElementsByTagName("video")[0]);
                    Hide(childern[i].getElementsByTagName("img")[0]);
                }
                connection.send({
                    sendcanvasdata: true,
                    state: false
                })
                maincamManager.hide();
                break;
        }

        classroomManager.updateClassroomInfo();
    };

    studentBtnHandler(e) {
        if (this.state.nowView == "STUDENT_CANVAS")
            return;
        store.dispatch({ type : CHANGE_CAMVIEW, data : 'STUDENT_CANVAS'});
        this.setState({ nowView: 'STUDENT_CANVAS' })

        let childern = document.getElementById("student_list").children;
        classroomInfo.showcanvas = true;
        for (let i = 0; i < childern.length; i++) {
            Show(childern[i].getElementsByTagName("img")[0]);
            Hide(childern[i].getElementsByTagName("video")[0]);
        }
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
                    <span id="session-id" />
                    {!store.getState().isOwner && <this.Students_Icon isAllContorl={this.state.isAllContorl} />} 
                    <LanguageSelector />
                    {store.getState().isOwner && <this.Features />}
                    <CurrentTime />
                </header>
            </>
        )
    };

    Students_Icon(props) {
        return (<> <div className='Student_permission_icon'>

            {props.isAllContorl && <img className="permission-icon" data-des={GetLang('STUDENT_ALLCONTROL')} src="/dashboard/img/lock.png" />}
            <img className="permission-icon" data-des={GetLang('STUDENT_SCREEN_SHARE')} id="student_screenshare" />
            <img className="permission-icon" data-des={GetLang('STUDENT_CANVAS')} id="student_canvas" />
            <img className="permission-icon" data-des={GetLang('STUDENT_MIC')} id="student_mic" /> 
            </div>
            </>
        )
    }

    exitRoom() {
        reactEvent.AlertBox({
            title: window.langlist.WARNING,
            content: window.langlist.EXIT_CONFIRM,
            yes: function () {
                connection.extra.roomOwner && connection.send({ roomBoom: true })
                classroomManager.gotoMain();
            }
        })
    }
}

function ToolTip() {
    return <div id="toptooltip">
        <span className="text"></span>
        <span className="sq"> </span>
    </div>
}

class CurrentTime extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startTime: 0,
            printTime: '00:00:00',
        }
    };

    render() {
        return <span className="time">
            <span id="current-time">{this.state.printTime}</span>
            <span id="recording-time">
                <img src="/dashboard/img/recording.png" style={{ display: 'none', marginRight: '7px', marginBottom: '2px' }} />
                <span className="text"></span>
            </span>
        </span>
    }

    componentDidMount() {
        reactEvent.classTimeStart = (time) => {
            this.setState({ startTime: time })
            setInterval(() => {
                let now = new Date().getTime() - this.state.startTime;
                now = parseInt(now * 0.001);
                let time = now;
                let hour = Math.floor(time / 3600);
                time %= 3600;

                let min = Math.floor(time / 60);
                time %= 60;

                hour = ("00" + hour).slice(-2);
                min = ("00" + min).slice(-2);
                time = ("00" + time).slice(-2);

                this.setState({
                    printTime: hour + ':' + min + ':' + time
                })
            }, 1000);
        }
    }
}

function CameraBtn(props) {
    return <img onClick={props.onClick} className={"top_icon view_type " + (props.nowView == "STUDENT_CAM" || props.nowView == "TEACHER_CAM" ? "view_type-on" : '')} data-des={GetLang('TOP_CAMERA')} id="top_camera" />
}

function StudentBtn(props) {
    return <img onClick={props.onClick} className={"top_icon view_type " + (props.nowView == "STUDENT_CANVAS" ? "view_type-on" : '')} data-des={GetLang('TOP_STUDNET_CANVAS')} id="top_student" />
}
