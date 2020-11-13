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
                    <img style={{pointerEvents : 'none'}} src="/dashboard/img/openchat.png" />
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
        this.setState({ numberOfStudents: connection.getAllParticipants().length });
        console.debug('Connected with ', "[", event.extra.userFullName, "]", "[", event.userid, "]");
        connection.send('plz-sync-points', event.userid);
        event.extra.roomOwner && classroomManager.rejoinTeacher();
        connection.extra.roomOwner && this.setState({ studentList: this.state.studentList.concat(event.userid) });
    };

    leftStudent(event) {
        this.setState({ numberOfStudents: connection.getAllParticipants().length });
        event.userid == GetOwnerId() && classroomManager.leftTeacher();
        connection.extra.roomOwner && this.setState({ studentList: this.state.studentList.filter(uid => uid != event.userid) })
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

class StudentList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapse : true
        }

        this.myRef = React.createRef();
        this.onClick = this.onClick.bind(this);
    }
    render() {
        const list = this.props.studentList.map(id => (<Student key={id} uid={id} />))
        return <div ref={this.myRef} id="student_list">
            <div onClick={this.onClick} id="student_list_button" />
            {list}
        </div>
    }

    onClick(self) {
        self = self.target;
        this.setState({collapse : !this.state.collapse}, () => {
            let list = this.myRef.current;
            let len = list.children.length;
            let line = Math.ceil(len / 4);
    
            if (!this.state.collapse) {
                list.appendChild(self);
                line = Math.max(4, line);
                self.innerHTML = "…";
            }
            else {
                self.innerHTML = "+" + (len - 16);
                list.insertBefore(self, list.children[15]);
                line = 4;
            }
            
            list.style.gridAutoRows = 100 / line + "%";
            list.style.height = 6 * line + "%";
        })
    }
}

class MainCam extends React.Component {
    render() {
        return <video id="main-video" playsInline autoPlay />
    }
}