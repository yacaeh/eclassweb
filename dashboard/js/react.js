
class App extends React.Component {
    state = {
        showMainVideo: false
    }

    constructor(props) {
        super(props);
    };

    render() {
        return (
            <>
                <Header />
                <Article />
                <PageNavigation />
                <URLViewer />
                <RightForm />
                <FileViewer />
            </>
        )
    };

    componentDidMount() {
        ChattingManager.init();
    }
}

class CurrentTime extends React.Component {
    render() {
        return <span className="time">
            <span id="current-time" />
            <span id="recording-time" />
            <img src="/dashboard/img/recording.png" style={{ display: 'none', marginRight: '7px', marginBottom: '2px' }} />
            <span className="text">0:00:00</span>
        </span>
    }
}

class AllControll extends React.Component {
    state = {
        on: false
    }

    render() {
        return <img className="top_icon top_all_controll_off" id="top_all_controll" onClick={this.clickHandler} />
    };

    clickHandler = (e) => {
        console.log(e);
        if (!this.state.on) {
            e.target.classList.add('top_all_controll_on');
            e.target.classList.remove('top_all_controll_off')
        }
        else {
            e.target.classList.add('top_all_controll_off');
            e.target.classList.remove('top_all_controll_on')
        }
        classroomInfo.allControl = !classroomInfo.allControl;
        this.setState({ on: classroomInfo.allControl });
        classroomManager.updateClassroomInfo(() => this.updateControlView(true));
    };

    updateControlView(send) {
        if (connection.extra.roomOwner) {

        }
        else {
            classroomInfo.allControl ? Show("student_isallcontrol") : Hide("student_isallcontrol");
        }


        if (send) {
            classroomInfo.allControl ?
                connection.send({ allControl: { state: true, roomInfo: classroomInfo } }) :
                connection.send({ allControl: { state: false } });
        }
    }
}

class Header extends React.Component {
    constructor(props) {
        super(props);
    }

    callAttend() {
        let callback = function () {
            let chilldren = document.getElementById('student_list').children;
            for (let i = 0; i < chilldren.length; i++) {
                let al = chilldren[i].getElementsByClassName('bor')[0];
                if (!al)
                    continue;
                al.className = "bor";
                al.classList.add('alert_wait');
            }
        }

        if (document.getElementById("exam-board").style.display == "block") {
            return;
        }


        alertBox("<span>" + $.i18n('NOTIFICATION_WARNING') + "</span>  ", $.i18n('NOTIFICATION'), () => {
            attentionManager.totalCount++;
            attentionManager.teacherRequest[attentionManager.totalCount] = {
                name: $.i18n('ATTENTION_PLEASE'),
            }
            callback();
            connection.send({
                alert: true
            });
        }, () => { });
    };

    componentDidMount() {
        ChattingManager.init();
    };

    render() {
        return (
            <>
                <header id="header">
                    <ToolTip />
                    <img id="icon_exit" onClick={this.exitRoom} />
                    <span id="my-name" />
                    <span id="session-id" />
                    <img className="permission-icon" id="student_screenshare" src="/dashboard/img/get_screenshare.png" />
                    <img className="permission-icon" id="student_canvas" src="/dashboard/img/get_canvas.png" />
                    <img className="permission-icon" id="student_mic" src="/dashboard/img/get_mic.png" />

                    <div className="icons">
                        <span className="controll">
                            <AllControll />
                            <img className="top_icon" id="top_test" />
                            <img className="top_icon" id="top_alert" onClick={this.callAttend} />
                            <img style={{ display: 'none' }} className="top_icon" id="top_attach-file" />
                        </span>
                        <LanguageSelector />
                    </div>

                    <span className="feature">
                        <img className="divide" />
                        <img className="top_icon view_type-on view_type" id="top_camera" />
                        <img className="top_icon view_type" id="top_student" />
                        <img className="top_icon" id="top_save_alert" />
                        <img className="top_icon" id="top_record_video" />
                    </span>

                    <CurrentTime />
                </header>
            </>
        )
    };

    exitRoom() {
        alertBox($.i18n('EXIT_CONFIRM'), $.i18n('WARNING'), () => {
            if (connection.extra.roomOwner) {
                connection.send({roomBoom: true})
            }
            classroomManager.gotoMain();
        },
            function () { }
        );
    }
}


class ToolTip extends React.Component {
    render() {
        return <div id="toptooltip">
            <span className="text"></span>
            <span className="sq"> </span>
        </div>
    }
}

class PageNavigation extends React.Component {
    render() {
        return (
            <>
                <div id="epub-navi" style={{ display: 'none' }} className="shadow-5">
                    <span id="navi-top">
                        <input id="epubidx" autoComplete="off" />
                        <span id="epubmaxidx" />
                        <img id="epub-collapse" />
                    </span>
                    
                    <span className="scroll2" id="thumbnail-list" />
                    <span id="navi-control">
                        <img id="lprev" />
                        <img id="prev" />
                        <img id="next" />
                        <img id="lnext" />
                    </span>
                </div>
            </>
        )
    }

    lprev() {

    };

    prev() {

    };

    next() {

    };

    lnext() {

    }
}

class StudentList extends React.Component {
    render() {
        return <div id="student_list">
            <div id="student_list_button" />
        </div>
    }
}

class MainCam extends React.Component {
    render() {
        return <video style={{ display: 'none', zIndex: 5 }} id="main-video" playsInline autoPlay />
    }
}

class RightForm extends React.Component {
    state = {
        collapsed: false
    }

    render() {
        return (
            <div id="right-tab" className="right-tab">

                <div id="right-tab-collapse" onClick={this.collapse}>
                    <img src="/dashboard/img/openchat.png" />
                </div>

                <span className="nos">
                    <span className="nos_student_text" id="nos">0</span>
                    <img className="nos_student_icon" src="/dashboard/img/student2.png" />
                </span>

                <div className="for_teacher" style={{ display: 'none' }}></div>
                <StudentList />
                <MainCam />
                <ChattingWindow />
            </div>

        )
    }

    collapse = (e) => {
        this.setState({ collapsed: !this.state.collapsed })
        if (!this.state.collapsed) {
            e.target.style.transform = "rotate(90deg)";
            $(rightTab).animate({ width: "0%" });
            $(widgetContainer).animate({ right: "0%" }, classroomManager.canvasResize);
        }
        else {
            e.target.style.transform = "rotate(-90deg)";
            $(rightTab).animate({ width: "17.7%" });
            $(widgetContainer).animate({ right: "17.7%" }, classroomManager.canvasResize);
        }
    }
}

class URLViewer extends React.Component {
    state = {
        url: undefined
    }

    constructor(props) {
        super(props);
    };

    render() {
        return (<>
            <div id="urlform" style={{ display: 'none' }}>
                <span className="name" data-i18n="FOOTAGE" />
                <span className="back" />
                <input id="urlinput"
                    onChange={this.handleChange}
                    onKeyUp={this.keyHandler}
                    type="text"
                    placeholder="URL을 입력하세요">
                </input>
            </div>
        </>)
    };

    handleChange = (e) => {
        this.setState({ url: e.target.value })
    };

    keyHandler = (e) => {
        if (window.event.keyCode == 13) {
            this.moveRenderFuction(this.state.url);
            e.target.value = '';
        }
    };

    moveRenderFuction(url) {
        const movie_type = getMovieType(url);

        if (movie_type == "YOUTUBE") {
            embedYoutubeContent(true, setURLString(url), true);
        }
        else if (movie_type == "ESTUDY" || movie_type == "MOVIE" || url.indexOf("mp4") !== -1) {
            VideoEdunetContent(true, setURLString(url), true);
        }
        else if (movie_type == "GOOGLE_DOC_PRESENTATION") {
            iframeGoogleDoc_Presentation(true, setURLString(url), true);
        }
        else {
            iframeEdunetContent(true, url, true);
        }
    }


}

class FileViewer extends React.Component {
    render() {
        return <div id="confirm-box" className="modal fade">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="confirm-title" onClick={this.ViewUploadList}></h5>
                        <h5 className="modal-title" id="confirm-title2" onClick={this.ViewHomeworkList}></h5>
                        <button type="button" className="close btn-confirm-close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div id="confirm-message" className="modal-body" />
                    <div className="modal-footer">
                        <button className="btn btn-danger" id="btn-confirm-file-close">현재 파일 닫기</button>
                        <button className="btn btn-confirm-close" id="btn-confirm-close">취소</button>
                        <button className="btn btn-primary" id="btn-confirm-action">확인</button>
                    </div>
                </div>
            </div>
        </div>
    }

    ViewUploadList(e) {
        if (!connection.extra.roomOwner)
            return;

        e.target.classList.add("selected");
        document.getElementById("confirm-title2").classList.remove("selected");
        $("form[name=upload]").show();
        getUploadFileList();
    };

    ViewHomeworkList(e) {
        e.target.classList.add("selected");
        document.getElementById("confirm-title").classList.remove("selected");
        $("form[name=upload]").hide();
        getUploadFileList("/homework");
    };
}

class Exam extends React.Component {
    render() {
        return <div id="exam-board" className="scroll">
            <div id="exam-teacher-menu" style={{ display: 'none' }} >
                <div id="exam-setting-bar">
                    <div id="exam-title" className="exam-border-bottom" data-i18n="QUIZ_CREATE">문제출제</div>
                    <div style={{ display: 'flex', width: '100%', height: '37px', background: '#EFF1F0' }} className="exam-border-bottom">
                        <label id="exam-question-count-label" htmlFor="exam-question-count" data-i18n="QUIZ_NUM" />
                        <input id="exam-question-count" type="number" />
                        <label id="exam-time-label" htmlFor="exam-time" data-i18n="QUIZ_TIME" />
                        <input id="exam-time" type="text" />
                        <button id="exam-setting-apply" className="btn btn-exam" data-i18n="QUIZ_SETTING"><b>설정</b></button>
                    </div>
                    <div id="exam-question-list" className="exam-border-bottom exam-overflow" style={{ textAlign: 'center' }} />
                    <button id="exam-start" className="btn btn-exam exam-80-button" data-i18n="QUIZ_START" />
                </div>
                <div id="exam-state" style={{ display: 'none' }} />
            </div>
            <div id="exam-omr" style={{ display: 'none' }} />
        </div>
    }
}

class AlertBox extends React.Component {
    render() {
        return <div id="alert-box" className="modal" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div id="alert-dialog">
                <div id="alert-header"><span id="alert-title" data-i18n="NOTIFICATION">알림</span></div>
                <div id="alert-body">
                    <div id="alert-content" />
                    <div id="alert-btns">
                        <button className="btn btn-alert-yes" style={{ paddingTop: '0px' }} data-i18n="YES">예</button>
                        <button className="btn btn-alert-no" style={{ paddingTop: '0px' }} data-i18n="NO">아니요</button>
                    </div>
                </div>
                <div id="alert-footer"></div>
            </div>
        </div>
    }
}

class Authorization extends React.Component {
    render() {
        return <div id="student-menu" style={{ display: 'none' }} className="student-menu shadow-5">
            <div className="stuname" data-i18n="NAME">이름</div>
            <div className="line1" />

            <div className="permission">
                <label data-i18n="STUDENT_SHARE_SCREEN">화면 공유</label>
                <span id="classP" className="perbtn off">
                    <span className="circle" />
                </span>
            </div>

            <div className="mic" >
                <label data-i18n="STUDENT_SHARE_MIC">마이크</label>
                <span id="micP" className="perbtn off">
                    <span className="circle" />
                </span>
            </div>

            <div className="canper">
                <label data-i18n="STUDENT_SHARE_CANVAS">판서 공유</label>
                <span id="canP" className="perbtn off">
                    <span className="circle" />
                </span>
            </div>
        </div>
    }
}

class Article extends React.Component {
    render() {
        return <article id="article">
            <div id="widget-container">
                <Exam />
                <AlertBox />
                <div id="edunetContent"></div>
            </div>
            <Authorization />
        </article>
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('app')
)