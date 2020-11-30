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
        const list = this.props.studentList.map(id => (
            <Student
                nowView={this.props.nowView}
                gridView={this.props.gridView}
                isOwner={id.isOwner}
                key={id.userId}
                uid={id.userId}
                name={id.userName} />
        ))

        const rendering = <table ref={this.myRef} id="student_list">
            {/* {!this.props.gridView && */}
                <div onClick={this.onClick} id="student_list_button">
                    {this.state.collapse ? ("+" + (list.length - 16)) : ("...")}
                </div>
            {/* } */}
            {list}
        </table>

        console.log(this.props.nowView)

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

    onClick(self) {
        self = self.target;
        this.setState({ collapse: !this.state.collapse }, () => {
            let list = this.myRef.current;
            let len = list.children.length;
            let line = Math.ceil(len / 4);

            if (!this.state.collapse) {
                list.appendChild(self);
                line = Math.max(4, line);
            }
            else {
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
            display: 'none',
            onMouseOver: false,
        }

        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onMouseClick = this.onMouseClick.bind(this);
        this.canvas = React.createRef();
        this.video = React.createRef();
    }

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
        }
        else {
            list.style.gridAutoRows = 100 / 4 + "%";
        }

        if (line <= 4) {
            btn.style.display = 'none';
        }
        else if (line >= 5) {
            on ? list.appendChild(btn) : list.insertBefore(btn, list.children[16])
            btn.style.display = "inline-block";
        }
    };

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
            this.canvas.current.style.display = 'none';

        if (this.props.uid in streamContainer) {
            let videoElement = this.video.current;
            videoElement.srcObject = streamContainer[this.props.uid];
        }
        canvasManager.canvas_array[this.props.uid] = this.canvas.current;
    };

    componentWillUnmount() {
        if (this.props.uid == classroomInfo.permissions.classPermission)
            classroomInfo.permissions.classPermission = undefined;

        if (this.props.uid == classroomInfo.permissions.micPermission)
            classroomInfo.permissions.micPermission = undefined;

        if (permissionManager.IsCanvasPermission(this.props.uid))
            permissionManager.DeleteCanvasPermission(this.props.uid);

        examObj.leftStudent(this.props.uid);
        delete canvasManager.canvas_array[this.props.uid];
        this.studentListResize();
    };

    render() {
        return <span
            style={{ cursor: store.getState().isOwner ? 'pointer' : 'default' }}
            onClick={store.getState().isOwner ? this.onMouseClick : undefined}
            onMouseLeave={store.getState().isOwner ? this.onMouseLeave : undefined}
            onMouseEnter={store.getState().isOwner ? this.onMouseEnter : undefined}
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
            <img style={{ display: this.props.nowView == STUDENT_CANVAS || this.state.onMouseOver ? 'block' : 'none' }} ref={this.canvas} />
            <video
                style={{
                    display: this.props.nowView == STUDENT_CANVAS || this.state.onMouseOver ? 'none' : 'block'
                }}
                ref={this.video}
                autoPlay={true}
                controls={false}
                className='student_cam' />

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

        if (this.props.gridView) {
            this.setState({ onMouseOver: true });
        }
        else {

            if (classroomInfo.permissions.canvasPermission.includes(this.props.uid))
                return;

            connection.send({
                sendcanvasdata: true,
                state: true
            }, this.props.uid)

            canvasManager.showingCanvasId = this.props.uid;
        }

    };

    onMouseLeave() {
        if (this.props.gridView) {
            this.setState({ onMouseOver: false });
        }
        else {
            if (!classroomInfo.showcanvas)
                connection.send({
                    sendcanvasdata: true,
                    state: false
                }, this.props.uid)

            if (!classroomInfo.permissions.canvasPermission.includes(this.props.uid))
                canvasManager.clearStudentCanvas(this.props.uid);

            canvasManager.showingCanvasId = undefined;
        }

    };
}