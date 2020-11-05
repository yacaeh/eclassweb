class Header extends React.Component {
    constructor(props) {
        super(props);
    }

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
                            <ExamIcon />
                            <Attention />
                            <img style={{ display: 'none' }} className="top_icon" id="top_attach-file" />
                        </span>
                        <LanguageSelector />
                    </div>

                    <span className="feature">
                        <img className="divide" />
                        <img className="top_icon view_type-on view_type" id="top_camera" />
                        <img className="top_icon view_type" id="top_student" />
                        <SaveNotification />
                        <ScreenRecorder />
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




function ToolTip() {
    return <div id="toptooltip">
        <span className="text"></span>
        <span className="sq"> </span>
    </div>
}