class RightForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
            numberOfStudents: 0,
            studentList: []
        }

        this.joinStudent = this.joinStudent.bind(this);
        this.leftStudent = this.leftStudent.bind(this);
    }

    render() {
        return (
            <div id="right-tab" className="right-tab">
                <div id="right-tab-collapse" onClick={this.collapse}>
                    <img style={{ pointerEvents: 'none' }} src="/dashboard/img/openchat.png" />
                </div>
                <NumberOfStudents num={this.state.numberOfStudents} />
                <Authorization />
                <StudentList studentList={this.state.studentList} />
                <MainCam />
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
            console.debug('Connected with ', "[", userName, "]", "[", userId, "]");
            connection.send('plz-sync-points', userId);
            ChattingManager.enterStudent(userName);
            event.extra.roomOwner && classroomManager.rejoinTeacher();
            const list = this.state.studentList.concat({ userId, userName });
            this.setState({ numberOfStudents: connection.getAllParticipants().length });
            connection.extra.roomOwner && this.setState({ studentList: list });
        })
    };

    leftStudent(event) {
        if (event.extra.userFullName == 'ycsadmin') return;
        this.setState({ numberOfStudents: connection.getAllParticipants().length });
        event.userid == GetOwnerId() && classroomManager.leftTeacher();
        connection.extra.roomOwner && this.setState({ studentList: this.state.studentList.filter(user => user.userId != event.userid) })
    }

    collapse = (e) => {
        this.setState({ collapsed: !this.state.collapsed })
        if (!this.state.collapsed) {
            e.target.style.transform = "rotate(90deg)";
            $(rightTab).animate({ width: "0%" });
            $(widgetContainer).animate({ right: "0%" }, classroomManager.canvasResize);
        }
        else {
            e.target.style.transform = "rotate(270deg)";
            $(rightTab).animate({ width: "17.7%" });
            $(widgetContainer).animate({ right: "17.7%" }, classroomManager.canvasResize);
        }
    }
}

function NumberOfStudents(props) {
    return <span className="nos">
        <span className="nos_student_text" >{props.num} </span>
        <img className="nos_student_icon" src="/dashboard/img/student2.png" />
    </span>
}


class MainCam extends React.Component {
    render() {
        return <video id="main-video" playsInline autoPlay />
    }
}