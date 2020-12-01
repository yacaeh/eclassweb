class StudentList extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
    }

    render() {
        let studentLength = this.props.studentList.length;
        if(!this.props.gridView && studentLength > 16)
            studentLength++;

        let list = this.props.studentList.map(id => (
            <Student
                numOfStudents={studentLength}
                nowView={this.props.nowView}
                gridView={this.props.gridView}
                isOwner={id.isOwner}
                key={id.userId}
                uid={id.userId}
                name={id.userName} />
        ))

        let line = 0;
        let column = 0;

        if(this.props.gridView){
            line = 7;
            column = 7;
        }
        else if(this.props.collapsed){
            line = 4;
            column = 4;
        }
        else{
            line = Math.ceil(studentLength / 4)
            column = 4;
        }

        const gridStyle = {
            gridAutoRows : 100 / line + "%",
            gridTemplateColumns : 'repeat(' + column + ', 1fr)'
        };

        if(this.props.gridView)
            list.splice(0,0,<TeacherCam key='teacher' gridView={this.props.gridView}/>)

        if (list.length > 16 && !this.props.gridView) {
            const btn = <this.StudentListBtn
                key='btn'
                onClick={this.props.onCollapseBtn}
                state={this.props.collapsed}
                length={studentLength}
            />
            this.props.collapsed ? list.splice(15,0,btn) : list.push(btn);
        }

        const rendering = <div 
        className={this.props.gridView ? "grid_view" : ''}
        style={gridStyle} ref={this.myRef} id="student_list">
            {list}
        </div>
        return rendering;
    }

    StudentListBtn(props){
        return <div 
        onClick={props.onClick} id="student_list_button">
            {props.state ? ("+" + (props.length - 16)) : ("...")}
        </div>
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


    componentDidMount() {
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
    };

    render() {
        return <span
                style={{ cursor: store.getState().isOwner ? 'pointer' : 'default' }}
                onClick={store.getState().isOwner ? this.onMouseClick : undefined}
                onMouseLeave={store.getState().isOwner ? this.onMouseLeave : undefined}
                onMouseEnter={store.getState().isOwner ? this.onMouseEnter : undefined}
                className={"student " + (this.props.gridView ? "grid" : '')}
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