const   STUDENT_CANVAS = 'STUDENT_CANVAS',
        STUDENT_CAM = 'STUDENT_CAM',
        GRID_CAM = 'GRID_CAM',
        TEACHER_CAM = 'TEACHER_CAM';

class RightForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
            numberOfStudents: 0,
            studentList: [],
            nowView: STUDENT_CAM,
            gridView: false,
        }
        this.rightTab = React.createRef();
        this.joinStudent = this.joinStudent.bind(this);
        this.leftStudent = this.leftStudent.bind(this);
        this.cameraBtnHandler = this.cameraBtnHandler.bind(this);
        this.studentBtnHandler = this.studentBtnHandler.bind(this);
        this.gridCamBtnHandler = this.gridCamBtnHandler.bind(this);

    }

    cameraBtnHandler(e) {
        let nextState = this.state.nowView == STUDENT_CAM ? TEACHER_CAM : STUDENT_CAM;
        this.setState({ nowView: nextState })
        classroomInfo.showcanvas = false;

        switch (nextState) {
            case STUDENT_CAM:
                connection.send({
                    sendcanvasdata: true,
                    state: false
                })
                break;
        }

        classroomManager.updateClassroomInfo();
    };

    studentBtnHandler(e) {
        if (this.state.nowView == STUDENT_CANVAS)
            return;

        this.setState({ nowView: STUDENT_CANVAS })
        classroomInfo.showcanvas = true;
        connection.send({
            sendcanvasdata: true,
            state: true
        })
        classroomManager.updateClassroomInfo();
    };

    gridCamBtnHandler(e) {
        this.setState({ gridView: !this.state.gridView });
    };

    render() {
        return (
            <div ref={this.rightTab} id="right-tab" className={this.state.collapsed ? 'tab-off' : 'tab-on'}>
                <div id="right-tab-collapse" onClick={this.collapse}>
                    <img style={{ pointerEvents: 'none' }} src="/dashboard/img/openchat.png" />
                </div>
                <Authorization />
                <CamChangeButtons
                    cameraBtnHandler={this.cameraBtnHandler}
                    studentBtnHandler={this.studentBtnHandler}
                    gridCamBtnHandler={this.gridCamBtnHandler}
                    nowView={this.state.nowView}
                />
                <NumberOfStudents num={this.state.numberOfStudents} />
                <CamForm
                    collapsed={this.state.collapsed}
                    gridView={this.state.gridView}
                    nowView={this.state.nowView}
                    studentList={this.state.studentList}
                />

                <ChattingWindow />
            </div>
        )
    }

    componentDidMount() {
        reactEvent.joinStudent = this.joinStudent;
        reactEvent.leftStudent = this.leftStudent;
    };

    joinStudent(event) {
        const userId = event.userid;

        connection.socket.emit("get-user-name", userId, (userName) => {
            if (userName == 'ycsadmin') return;
            connection.send('plz-sync-points', userId);
            console.debug('Connected with ', "[", userName, "]", "[", userId, "]");
            event.extra.roomOwner && classroomManager.rejoinTeacher();
            let isOwner = event.extra.roomOwner;
            const list = this.state.studentList.concat({ userId, userName, isOwner });
            this.setState({ studentList: list });
            this.setState({ numberOfStudents: list.length });
            reactEvent.enterOrExit(userName, isOwner, "ENTER");
        })
    };

    leftStudent(event) {
        if (event.extra.userFullName == 'ycsadmin') return;
        const student = this.state.studentList.filter(user => user.userId == event.userid)[0];
        if(!student) return;
        reactEvent.enterOrExit(student.userName, student.isOwner, "EXIT");
        const list = this.state.studentList.filter(user => user.userId != event.userid);

        this.setState({ studentList: list });
        this.setState({ numberOfStudents: list.length });
        event.userid == GetOwnerId() && classroomManager.leftTeacher();
    }

    collapse = (e) => {
        this.setState({ collapsed: !this.state.collapsed })

        if (!this.state.collapsed) {
            e.target.style.transform = "rotate(90deg)";
            widgetContainer.style.right = "0%";
            classroomManager.canvasResize();
        }
        else {
            e.target.style.transform = "rotate(270deg)";
            widgetContainer.style.right = "17.7%";
            classroomManager.canvasResize();
        }
    }
}
class CamForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed : true
        }
        this.onCollapseBtn = this.onCollapseBtn.bind(this);
    }
    
    onCollapseBtn() {
        this.setState({ collapsed: !this.state.collapsed })
    }

    render() {
        let style;
        let line = Math.ceil((this.props.studentList.length + 1) / 4);

        if(this.props.gridView)         style = {height:'100%'};
        else if(this.state.collapsed)   style = {height:'24%'}
        else if(!this.state.collapsed)  style = {height : line * 6 + '%'}

        const rendering = <div style={style} id="cam_form">
            <StudentList
                onCollapseBtn={this.onCollapseBtn}
                collapsed={this.state.collapsed}
                gridView={this.props.gridView}
                nowView={this.props.nowView}
                studentList={this.props.studentList} />
            <TeacherCam nowView={this.props.nowView} gridView={this.props.gridView}/>
        </div>;

        if (this.props.gridView) {
            return ReactDOM.createPortal(
                rendering,
                document.getElementById('canvas-div')
            )
        }
        else {
            return rendering;
        }
    }
}
class TeacherCam extends React.Component {
    constructor(props) {
        super(props);
        this.video = React.createRef();
    }

    componentDidMount() {
        if (connection && GetOwnerId() in streamContainer) {
            this.video.current.srcObject = streamContainer[GetOwnerId()];
        }
    }

    render() {
        const video = <video 
            style={{display : this.props.nowView == TEACHER_CAM || this.props.gridView ? 'block' : 'none' }} 
            ref={this.video} 
            id="main-video" 
            playsInline autoPlay />
        return video;
    }
}

function NumberOfStudents(props) {
    return <span className="nos">
        <span className="nos_student_text" >{props.num} </span>
        <img className="nos_student_icon" src="/dashboard/img/student2.png" />
    </span>
}

function CamChangeButtons(props) {
    const btns = <>
        {!store.getState().isMobile && <CameraBtn nowView={props.nowView} onClick={props.cameraBtnHandler} />}
        {store.getState().isOwner && <StudentBtn nowView={props.nowView} onClick={props.studentBtnHandler} />}
        {store.getState().isOwner && <GridCamBtn nowView={props.nowView} onClick={props.gridCamBtnHandler} />}
    </>
    const parent = document.getElementById("header-feature");
    if (parent)
        return ReactDOM.createPortal(
            btns,
            document.getElementById("header-feature")
        )
    else
        return btns;
}

function CameraBtn(props) {
    return <img
        src="/dashboard/img/cam.png"
        onMouseEnter={onOver}
        onMouseLeave={onLeave}
        onClick={props.onClick}
        className={"top_icon view_type " + (props.nowView == STUDENT_CAM || props.nowView == TEACHER_CAM ? "view_type-on" : '')}
        data-des={GetLang('TOP_CAMERA')
        } id="top_camera" />
}

function StudentBtn(props) {
    return <img
        src='/dashboard/img/student.png'
        onMouseEnter={onOver}
        onMouseLeave={onLeave}
        onClick={props.onClick}
        className={"top_icon view_type " + (props.nowView == STUDENT_CANVAS ? "view_type-on" : '')}
        data-des={GetLang('TOP_STUDNET_CANVAS')
        } id="top_student" />
}

function GridCamBtn(props) {
    return <img
        src='/dashboard/img/grid.png'
        onMouseEnter={onOver}
        onMouseLeave={onLeave}
        onClick={props.onClick}
        className={"top_icon view_type " + (props.nowView == GRID_CAM ? "view_type-on" : '')}
        data-des={GetLang('GRID_VIEW')
        } id="top_student" />
}