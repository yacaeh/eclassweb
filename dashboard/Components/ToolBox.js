
class ToolBox extends React.Component {
    render() {
        return <section id="tool-box" className="tool-box">
            <ToolBoxIcon key='onoff-icon' className='on' src='/dashboard/img/view_on.png' id='onoff-icon' />
            <ToolBoxIcon key='pencilIcon' className='draw' src='/dashboard/img/pen.png' id='pencilIcon' />
            <ToolBoxIcon key='markerIcon' className='draw' src='/dashboard/img/pen2.png' id='markerIcon' />
            <ToolBoxIcon key='eraserIcon' className='i draw' src='/dashboard/img/eraser.png' id='eraserIcon' />
            <ToolBoxIcon key='textIcon' className='i draw' src='/dashboard/img/text.png' id='textIcon' />
            <ToolBoxIcon key='undo' className='i draw' src='/dashboard/img/undo.png' id='undo' />
            <ToolBoxIcon key='clearCanvas' className='i draw' src='/dashboard/img/trash.png' id='clearCanvas' />
            <ToolBoxLine key='------------------------' />
            <ToolBoxIcon key='screen_share' onClick={ScreenShareButton} className='i' src='/dashboard/img/screenshare.png' id='screen_share' />
            <ToolBoxIcon key='3d_view' onClick={_3DCanvasButton} className='i' src='/dashboard/img/3D.png' id='3d_view' />
            <ToolBoxIcon key='movie' onClick={MovieRenderButton} className='i' src='/dashboard/img/videolink.png' id='movie' />
            <ToolBoxIcon key='file' onClick={FileviewerButton} className='i' src='/dashboard/img/openfile.png' id='file' />
            <ToolBoxIcon key='callTeacher' onClick={CallTeacherButton} className='i' src='/dashboard/img/handsup.png' id='callteacher' />
            <ToolBoxIcon key='homework' onClick={HomeworkUploadModal} className='i' src='/dashboard/img/homework.png' id='homework' />
            <ToolBoxIcon key='full' className='i no-hover' src='/dashboard/img/cam_max.png' id='full' />
        </section>
    }
}


function ScreenShareButton(e) {
    // const Todo = ReactRedux.connect();
    // let action = {type:'SCREEN_SHARE', id:1};
    // store.dispatch(action);
    screenshareManager.btn(e.target);
}

function FileviewerButton(e) {
    LoadFile(e.target);
}

function CallTeacherButton(e){
    classroomManager.callTeacher();
}

function MovieRenderButton(btn) {
    if (!isSharingMovie && checkSharing()) {
        removeOnSelect(btn.target);
        return;
    }
    let urlform = document.getElementById("urlform");
    btn.target.classList.toggle("on");
    btn.target.classList.toggle("selected-shape");
    var visible = urlform.style.display;
    if (visible == "inline-block") {
        classroomInfo.movierender = {
            state: false,
            url: undefined
        };
        classroomManager.updateClassroomInfo(function () { });
        isSharingMovie = false;
        urlform.style.display = "none";
        embedYoutubeContent(false, "", true);
    }
    else {
        isSharingMovie = true;
        urlform.style.display = "inline-block";
    }
}

function _3DCanvasButton(btn) {
    if (!classroomInfo.share3D.state && checkSharing()) {
        removeOnSelect(btn.target);
        return;
    }

    btn.target.classList.toggle("on");
    btn.target.classList.toggle("selected-shape");

    canvasManager.clear();
    const isViewer = !classroomInfo.share3D.state;
    classroomInfo.share3D.state = isViewer;
    isSharing3D = isViewer;
    classroomManager.updateClassroomInfo(() => {
        setShared3DStateLocal(isViewer)
        connection.send({
            modelEnable: { enable: classroomInfo.share3D.state }
        });
    })
}

class ToolBoxIcon extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.setIcon = this.setIcon.bind(this);
        this.setIcon(props.src);
    }
    render() {
        return <canvas onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} data-src={this.props.src}
            ref={this.myRef}
            className={this.props.className}
            id={this.props.id}
            onClick={this.props.onClick}
            width="28" height="28" />;
    }

    onMouseEnter(e){ 
        if (e.target.classList.contains("off"))
            return false;

        let pop = document.getElementById("toolboxHelper");
        pop.style.display = 'block';
        let rect = e.target.getBoundingClientRect();
        let y = rect.y;
        pop.style.top = y - 40 + 'px';
        pop.children[0].innerHTML = e.target.dataset.content;
    }

    onMouseLeave(){
        let pop = document.getElementById("toolboxHelper");
        pop.style.display = 'none';
    }

    setIcon(src) {
        let image = new Image();
        image.onload = () => {
            let context = this.myRef.current.getContext('2d');
            context.drawImage(image, 0, 0, 28, 28);
        }
        image.src = src;
    }
}

function ToolBoxLine() {
    return <div className="tooldivide" />
}
class ToolBoxHelp extends React.Component {
    render() {
        return <section id="toolboxHelper">
            <span id="titletext" />
            <span className="sq" />
        </section>
    }
}