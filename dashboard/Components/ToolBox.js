
class ToolBox extends React.Component {
    render() {
        return <section id="tool-box" className="tool-box">
            <canvas className="on" id="onoff-icon" className="on" width="28" height="28" ></canvas>
            <ToolBoxIcon key='pencilIcon' className='draw' src='/dashboard/img/pen.png' id='pencilIcon' />
            <ToolBoxIcon key='markerIcon' className='draw' src='/dashboard/img/pen2.png' id='markerIcon' />
            <ToolBoxIcon key='eraserIcon' className='i draw' src='/dashboard/img/eraser.png' id='eraserIcon' />
            <ToolBoxIcon key='textIcon' className='i draw' src='/dashboard/img/text.png' id='textIcon' />
            <ToolBoxIcon key='undo' className='i draw' src='/dashboard/img/undo.png' id='undo' />
            <ToolBoxIcon key='clearCanvas' className='i draw' src='/dashboard/img/trash.png' id='clearCanvas' />
            <ToolBoxLine />
            <ScreenShareButton />
            <_3DCanvasButton />
            <MovieRenderButton />
            <FileviewerButton />
            <EpubButton />
            <CallteacherButton />
            <HomeworkButton />
            <canvas className="i no-hover" id="full" width="28" height="28" />
        </section>
    }
}


function CallteacherButton(){
    function onClick(){
        classroomManager.callTeacher()
    }
    return <ToolBoxIcon className='i' onClick={onClick} src='/dashboard/img/handsup.png' id='callteacher' />
}

function ScreenShareButton(){
    function onClick(e) {
        screenshareManager.btn(e.target);
    }
    return <ToolBoxIcon className='i' onClick={onClick} src='/dashboard/img/screenshare.png' id='screen_share' />
}

function FileviewerButton() {
    function onClick(e) {
        LoadFile(e.target);
    }
    return <ToolBoxIcon className='i' onClick={onClick} src='/dashboard/img/openfile.png' id='file' />
}

function EpubButton() {
    function onClick(btn) {
        btn = btn.target;

        if (!isSharingEpub && checkSharing()) {
            removeOnSelect(btn);
            return;
        }

        btn.classList.toggle("on");
        btn.classList.toggle("selected-shape");
          
        if (epubManager.isEpubViewer === false) {
            isSharingEpub = true;
            epubManager.isEpubViewer = true;
            epubManager.loadEpubViewer();
            classroomCommand.sendOpenEpub();
        } else {
            isSharingEpub = false;
            epubManager.isEpubViewer = false;
            epubManager.unloadEpubViewer();
            $('#canvas-controller').hide();
            classroomCommand.sendCloseEpub();
        }
    }
    return <ToolBoxIcon className='i' onClick={onClick} src='/dashboard/img/epub.png' id='epub' />
}

function HomeworkButton() {
    function onClick() {
        HomeworkUploadModal()
    }
    return <ToolBoxIcon className='i' onClick={onClick} src='/dashboard/img/homework.png' id='homework' />
}


function MovieRenderButton() {
    function onClick(btn) {
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

    return <ToolBoxIcon className='i' onClick={onClick} src='/dashboard/img/videolink.png' id='movie' />
}

function _3DCanvasButton() {
    function onClick(btn) {
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

    return <ToolBoxIcon className='i' onClick={onClick} src='/dashboard/img/3D.png' id='3d_view' />
}

class ToolBoxIcon extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.setIcon = this.setIcon.bind(this);
        this.setIcon(props.src);
    }
    render() {
        return <canvas data-src={this.props.src}
            ref={this.myRef}
            className={this.props.className}
            id={this.props.id}
            onClick={this.props.onClick}
            width="28" height="28" />;
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