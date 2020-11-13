
class ToolBox extends React.Component {
    render() {
        return <section id="tool-box" className="tool-box">
            <canvas className="on" id="onoff-icon" className="on" width="28" height="28" ></canvas>
            <ToolBoxIcon className='draw' src='/dashboard/img/pen.png' id='pencilIcon' />
            <ToolBoxIcon className='draw' src='/dashboard/img/pen2.png' id='markerIcon' />
            <ToolBoxIcon className='i draw' src='/dashboard/img/eraser.png' id='eraserIcon' />
            <ToolBoxIcon className='i draw' src='/dashboard/img/text.png' id='textIcon' />
            <ToolBoxIcon className='i draw' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABPxJREFUeNrsnVuIVVUYx9dpQiIdvOBtDGa8RILSQz4koWYvRZeXEkRztJd8ExGkSPBRSxDMB0ESxBBpSnyLMCGJChV6SSURpEkcZia8RjqpmTTT97HXYQYcZ87Za5+z917f7wd/BhT1eNZvfWutvdbeuzI0NOTALk/wFSAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAlBq9LyAkJeY5yWeSmabbz6gA70n6JX9LplkWwNoQME/yleSwZI7ktn6HzAFsoL3+R8kaBv5hnjTS63fR8DYrAL3eaAWg1xuuAPR6oxWAXm+4AtDrjVYA7fWfSNbSlPYqQLXX0/jGKgC93nAFoNcbrQD0esMVgF5vtALQ6w1XAHq90QqQR6//jwpgt9dXJE9LWqwKUAk91lWpVEI/Q4fkY0lnDv9/7f2/Sf5yyfEw/XlLck3SI+mT9PqfA0VswOD2y1mATt/4HQXuJPcl170oFyVnJeckl/zvIUDKsV4b/t2SVs5/Jb9Lzki+l/wg+aOMAuRxKniDL69DEUUrxDE/f5nWbAHKcix8ruTLyBp+tFyW7JY8jwDDrI+w14+Xu5IjkhctCzDPSK8fK/9IDrrkTiRTAmww2OvHii4tt/nrDlELoGP9FzT4Y6Mrh5diFaCTXl9T9KLShzEJMJexPlW6JDPKLsBGfxGEBk2XXyQL8xIgi82gQQchvCA5IVma27XkDIaADiZ+mawSXolhEniFxkydm5KVLANt56pkSQwXgqgG6dMtaY/hUjBzg/TR01ETY9kMWkc1SJW9sW0HUw3qiy6x34lFAOYG6aLf1eyYBGBuUH8OxCYAc4P6omcQl8UoQN5zg0G/M6enex8WXILv3Cj3cYS2XxHuCxh5gGRnrevfjPhT8qo/tTPJZ6pLnh/c7uXU4WqBZLrL/0aatyTHy34qeLxq0NXEXqWneVvH+UwtXoiXJZslR3M883DSJXczRTUEPG6l0Iwv+Ybv2fUyRfKGZJ9L7g9olgB6J9MKCwI0a26QVoCRTJa87ZL7AgaaIMEhKwJUWd/AlUIWAoxkkZ/HXG7wjmGbJQEaWQ2yFqCKHvPa6jd1GiHBRmsCNGpu0CgBqsxyydNL72UswNdWBci6GjRagCp6DPznDAXQW9jnWBUgy7lBswSorhz2ZyjBKusCZFENmilAlS2SBxkIsAcBwncY8xBAWe2G31eUNj/plUkECNthzEsA5U1/KTrkFPFMBAirBnkKoLwuuROwkbWc18Y9ilaBlX5PoejoDSHv++3euvfhXHL7fRCxvjSqx1eC6oMpioxeQv4g5Z99NvhfN/Dm0LFWCnkPASPZk2IY+Jw5QNjcoEgCTJB8W6cA3yBA2EqhSAIoz7j6NpJOI0D6atDnL8jMKNhne81PCmsR4FcESM98l7w+vq2An21HjQJ0I0A4RVwJPSU5VYMAvVwHCKeID7jQQ6qbXPIA67FoidF+SDjvkrME5sofDPOpS84RNKx6IUCx0aFgq1+tUAGMog+WPIAAttFl4ZVRfr2CADbQo+DbEcA2+iTW4whgF73w85HL+OVVCFAuLjh/GNQzIfQvLNLt4VAbrX4o0FfS9Ev7Lc5VACg3DAEIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgApeN/AQYAUjtq/Zx6jVYAAAAASUVORK5CYII=' id='undo' />
            <ToolBoxIcon className='i draw' src='/dashboard/img/trash.png' id='clearCanvas' />
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
    function onClick() {
        LoadFile();
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
        HomeworkUploadModal($.i18n('SUBMIT_ASSIGNMENT'))
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
        return <canvas
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