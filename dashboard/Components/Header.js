class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nowView: 'STUDENT_CAM',
        }

        this.Features = this.Features.bind(this);
        this.cameraBtnHandler = this.cameraBtnHandler.bind(this);
        this.studentBtnHandler = this.studentBtnHandler.bind(this);
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
        // store.dispatch({type : CHANGE_CAMVIEW, data : nextState });

        classroomInfo.showcanvas = false;
        let childern = document.getElementById("student_list").getElementsByClassName('student');
        console.log(childern);

        switch (nextState) {
            case "TEACHER_CAM":
                maincamManager.show();
                break;
            case "STUDENT_CAM":
                for (let i = 0; i < childern.length; i++) {
                    let video = childern[i].getElementsByTagName("video")[0];
                    if(video)
                        childern[i].getElementsByTagName("video")[0].style.display = 'block';
                    childern[i].getElementsByTagName("img")[0].style.display = 'none';
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
        // store.dispatch({ type : CHANGE_CAMVIEW, data : 'STUDENT_CANVAS'});
        this.setState({ nowView: 'STUDENT_CANVAS' })

        maincamManager.hide();
        let childern = document.getElementById("student_list").getElementsByClassName('student');
        classroomInfo.showcanvas = true;
        for (let i = 0; i < childern.length; i++) {
            let video = childern[i].getElementsByTagName("video")[0];
            if(video)
                childern[i].getElementsByTagName("video")[0].style.display = 'none';

            childern[i].getElementsByTagName("img")[0].style.display = 'block';
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
                    <img id="Button_Exit" onClick={this.exitRoom} />
                    <span id="session-id"> {store.getState().userName + "(" + store.getState().sessionID + ")"}</span>
                    <LanguageSelector />
                    <this.Features />
                    <CurrentTime />
                </header>
            </>
        )
    };

    
    Features(){
        return <span className="feature">
             {store.getState().isOwner && <span>
                <AllControll onMouseEnter={onOver} onMouseLeave={onLeave}/>
                <ExamIcon onMouseEnter={onOver} onMouseLeave={onLeave}/>
                <Attention onMouseEnter={onOver} onMouseLeave={onLeave}/>
                <SaveNotification onMouseEnter={onOver} onMouseLeave={onLeave}/>
                <ScreenRecorder onMouseEnter={onOver} onMouseLeave={onLeave}/>
                <img className="divide" />
                <CameraBtn nowView={this.state.nowView} onClick={this.cameraBtnHandler} onMouseEnter={onOver} onMouseLeave={onLeave}/>
                <StudentBtn nowView={this.state.nowView} onClick={this.studentBtnHandler} onMouseEnter={onOver} onMouseLeave={onLeave}/>
            </span>}

            {!store.getState().isOwner && <this.Students_Icon isAllContorl={store.getState().classroomInfo.allControl} />} 
        </span>
        
    }
 
    Students_Icon(props) {
        return (<> <div className='Student_permission_icon'>
            {props.isAllContorl && <img onMouseEnter={onOver} onMouseLeave={onLeave}  className="top_icon" data-des={GetLang('STUDENT_ALLCONTROL')} src="/dashboard/img/lock.png" />}
            {store.getState().permissions.screen && <img onMouseEnter={onOver} onMouseLeave={onLeave} className="top_icon" data-des={GetLang('STUDENT_SCREEN_SHARE')} id="student_screenshare" />}
            {store.getState().permissions.canvas && <img onMouseEnter={onOver} onMouseLeave={onLeave} className="top_icon" data-des={GetLang('STUDENT_CANVAS')} id="student_canvas" />}
            {store.getState().permissions.mic && <img onMouseEnter={onOver} onMouseLeave={onLeave} className="top_icon" data-des={GetLang('STUDENT_MIC')} id="student_mic" /> }
            </div>
            </>
        )
    }

    exitRoom() {
        reactEvent.AlertBox({
            title: GetLang('WARNING'),
            content: GetLang('EXIT_CONFIRM'),
            yes: function () {
                connection.extra.roomOwner && connection.send({ roomBoom: true })
                classroomManager.gotoMain();
            }
        })
    }
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
        setInterval(() => {
            let now = new Date().getTime() - store.getState().classroomInfo.roomOpenTime;
            now = parseInt(now * 0.001);
            let time = now;
            let hour = Math.floor(time / 3600);
            time %= 3600;

            let min = Math.floor(time / 60);
            time %= 60;

            hour = ("00" + hour).slice(-2);
            min = ("00" + min).slice(-2);
            time = ("00" + time).slice(-2);

            let printTime = hour + ':' + min + ':' + time;

            this.setState({printTime})
        }, 1000);
    }
}

function CameraBtn(props) {
    return <img onMouseEnter={props.onMouseEnter} onMouseLeave={props.onMouseLeave} onClick={props.onClick} className={"top_icon view_type " + (props.nowView == "STUDENT_CAM" || props.nowView == "TEACHER_CAM" ? "view_type-on" : '')} data-des={GetLang('TOP_CAMERA')} id="top_camera" />
}

function StudentBtn(props) {
    return <img onMouseEnter={props.onMouseEnter} onMouseLeave={props.onMouseLeave} onClick={props.onClick} className={"top_icon view_type " + (props.nowView == "STUDENT_CANVAS" ? "view_type-on" : '')} data-des={GetLang('TOP_STUDNET_CANVAS')} id="top_student" />
}

function onOver(e){
    let element = e.target;
    let tooltip = document.getElementById("toptooltip");
    tooltip.style.display = 'block';
    tooltip.children[0].innerHTML = element.dataset.des;
    let width = tooltip.getBoundingClientRect().width / 2;
    tooltip.style.left = 
        e.target.getBoundingClientRect().x + 
        (e.target.getBoundingClientRect().width / 2) - width + "px";
}

function onLeave(e){
    let element = e.target;
    let tooltip = document.getElementById("toptooltip");
    element.addEventListener("mouseleave", function () {
        tooltip.style.display = 'none';
    })
}
