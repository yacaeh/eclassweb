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


class Student extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            name : undefined,
            class : false,
            mic : false,
            canvas : false,
            display : 'none'
        }

        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onMouseClick = this.onMouseClick.bind(this);
        this.myRef = React.createRef();

        let _this = this;
        connection.socket.emit("get-user-name", this.props.uid, function(e){
            _this.setState({name : e});
            ChattingManager.enterStudent(e);
        })
    }

    componentDidMount(){
        this.studentListResize();

        if (classroomInfo.permissions.classPermission == this.props.uid) {
            this.setState({class : true});
            MakeIcon(this.props.uid, "screen");
        }
    
        if (classroomInfo.permissions.micPermission == this.props.uid) {
            this.setState({mic : true});
            MakeIcon(this.props.uid, "mic");
        }
    
        if (classroomInfo.permissions.canvasPermission.includes(this.props.uid)) {
            this.setState({canvas : true});
            MakeIcon(this.props.uid, "canvas");
        }

        if (!classroomInfo.showcanvas)
            this.myRef.current.style.display = 'none';

        canvasManager.canvas_array[this.props.uid] = this.myRef.current;
    };

    studentListResize() {
        let btn = document.getElementById("student_list_button")
        let list = document.getElementById("student_list");
        let len = list.children.length - 1;
        let on = btn.classList.contains("on");

        if (on && len != 16)
            len++;
        let line = Math.ceil(len / 4);

        if (on) {
            line = Math.max(4, line);
            list.style.gridAutoRows = 100 / line + "%";
            list.style.height = 6 * line + "%";
        }
        else {
            btn.innerHTML = "+" + (len - 15);
            list.style.gridAutoRows = 100 / 4 + "%";
            list.style.height = 6 * 4 + "%";
        }

        if (line <= 4) {
            btn.style.display = 'none';
        }
        else if (line >= 5) {
            on ? list.appendChild(btn) : list.insertBefore(btn, list.children[16])
            btn.style.display = "inline-block";
        }
    };


    componentWillUnmount(){
        if (this.props.uid == classroomInfo.permissions.classPermission)
            classroomInfo.permissions.classPermission = undefined;

        if (this.props.uid == classroomInfo.permissions.micPermission)
            classroomInfo.permissions.micPermission = undefined;

        if (permissionManager.IsCanvasPermission(this.props.uid))
            permissionManager.DeleteCanvasPermission(this.props.uid);

        ChattingManager.leftStudent(this.state.name);
        examObj.leftStudent(this.props.uid);
        delete canvasManager.canvas_array[this.props.uid];
        console.debug("Left student", "[", this.props.uid, "]", "[", this.state.name, "]");
        this.studentListResize();
    };
    
    render(){
        return <span 
            onClick={this.onMouseClick}
            onMouseLeave={this.onMouseLeave} 
            onMouseEnter={this.onMouseEnter} 
        className = "student" 
        data-name = {this.state.name} 
        data-id={this.props.uid}
        data-class-permission = {this.state.class}
        data-mic-permission = {this.state.mic}
        data-canvas-permission = {this.state.canvas}>
            <span className = 'permissions' style={{display : 'none'}}  />
            <span className = 'student-overlay' />
            <span className = 'bor' />
            <span className = 'name'>{this.state.name}</span>
            <img ref={this.myRef} />
        </span>
    }

    onMouseClick(e){
        OnClickStudent(e, this.props.uid , this.state.name);
    }

    onMouseEnter(){
        if (classroomInfo.permissions.canvasPermission.includes(this.props.uid))
            return;

        connection.send({
            sendcanvasdata: true,
            state: true
        }, this.props.uid)

        canvasManager.showingCanvasId = this.props.uid;
    };

    onMouseLeave() {
        if (!classroomInfo.showcanvas)
            connection.send({
                sendcanvasdata: true,
                state: false
            }, this.props.uid)

        if (!classroomInfo.permissions.canvasPermission.includes(this.props.uid))
            canvasManager.clearStudentCanvas(this.props.uid);

        canvasManager.showingCanvasId = undefined;
    };
}