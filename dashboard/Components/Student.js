class StudentList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapse: true
        }

        this.myRef = React.createRef();
        this.onClick = this.onClick.bind(this);
    }
    render() {
        const list = this.props.studentList.map(id => (<Student key={id.userId} uid={id.userId} name={id.userName} />))
        return <div ref={this.myRef} id="student_list">
            <div onClick={this.onClick} id="student_list_button" />
            {list}
        </div>
    }

    onClick(self) {
        self = self.target;
        this.setState({ collapse: !this.state.collapse }, () => {
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
            class: false,
            mic: false,
            canvas: false,
            display: 'none'
        }

        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onMouseClick = this.onMouseClick.bind(this);
        this.myRef = React.createRef();
    }

    componentDidMount() {
        this.studentListResize();
        if (classroomInfo.permissions.classPermission == this.props.uid) {
            this.setState({ class: true });
            MakeIcon(this.props.uid, "screen");
        }

        if (classroomInfo.permissions.micPermission == this.props.uid) {
            this.setState({ mic: true });
            MakeIcon(this.props.uid, "mic");
        }

        if (classroomInfo.permissions.canvasPermission.includes(this.props.uid)) {
            this.setState({ canvas: true });
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


    componentWillUnmount() {
        if (this.props.uid == classroomInfo.permissions.classPermission)
            classroomInfo.permissions.classPermission = undefined;

        if (this.props.uid == classroomInfo.permissions.micPermission)
            classroomInfo.permissions.micPermission = undefined;

        if (permissionManager.IsCanvasPermission(this.props.uid))
            permissionManager.DeleteCanvasPermission(this.props.uid);

        ChattingManager.leftStudent(this.props.name);


        examObj.leftStudent(this.props.uid);
        delete canvasManager.canvas_array[this.props.uid];
        console.debug("Left student", "[", this.props.uid, "]", "[", this.props.name, "]");
        this.studentListResize();
    };

    render() {
        return <span
            onClick = {store.getState().isOwner ? this.onMouseClick : undefined}
            onMouseLeave = {store.getState().isOwner ? this.onMouseLeave : undefined}
            onMouseEnter = {store.getState().isOwner ? this.onMouseEnter : undefined}

            className="student"
            data-name={this.props.name}
            data-id={this.props.uid}
            data-class-permission={this.state.class}
            data-mic-permission={this.state.mic}
            data-canvas-permission={this.state.canvas}>
            <span className='permissions' style={{ display: 'none' }} />
            <span className='student-overlay' />
            <span className='bor' />
            <span className='name'>{this.props.name}</span>
            <img ref={this.myRef} />
        </span>
    }

    onMouseClick(e) {
        var menu = document.getElementById('student-menu');
        permissionManager.nowSelectStudent = e.target;

        SetBtn("classP", e.target.dataset.classPermission);
        SetBtn("micP", e.target.dataset.micPermission);
        SetBtn("canP", e.target.dataset.canvasPermission);

        function SetBtn(uid, ispermission) {
            let btn = $('#' + uid);
            let circle = $('#' + uid + '> .circle');

            btn.clearQueue();
            circle.clearQueue();

            if (ispermission == 'true') {
                btn.css({ 'background-color': '#18dbbe' });
                circle.css({ left: '22px' });
                btn.addClass('on');
                btn.removeClass('off');
            } else {
                btn.css({ 'background-color': 'gray', });
                circle.css({ left: '2px', });
                btn.addClass('off');
                btn.removeClass('on');
            }
        }

        menu.style.right = document.body.clientWidth - e.clientX + 'px';
        menu.style.top = e.clientY - 50 + 'px';

        if (!$('#student-menu').is(':visible')) {
            $('#student-menu').show('blind', {}, 150, function () { });
        }

        menu.getElementsByClassName('stuname')[0].innerHTML = this.props.name;
    }

    onMouseEnter() {
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