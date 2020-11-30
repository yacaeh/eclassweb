class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nowView: 'STUDENT_CAM',
        }

        this.Features = this.Features.bind(this);
    }

    render() {
        return (
            <>
                <header id="header">
                    <img id="Button_Exit" onClick={this.exitRoom} />
                    <span id="session-id"> {store.getState().userName + "(" + store.getState().sessionID + ")"}</span>
                    <LanguageSelector />
                    <this.Features />
                    <CurrentTime />
                </header>
            </>
        )
    };
    
    Features(){
        return <span id="header-feature" className="feature">
             {store.getState().isOwner && <>
                <AllControll onMouseEnter={onOver} onMouseLeave={onLeave}/>
                <ExamIcon onMouseEnter={onOver} onMouseLeave={onLeave}/>
                <Attention onMouseEnter={onOver} onMouseLeave={onLeave}/>
                <SaveNotification onMouseEnter={onOver} onMouseLeave={onLeave}/>
                <ScreenRecorder onMouseEnter={onOver} onMouseLeave={onLeave}/>
                <img className='divide'/>
                
            </>}

            {!store.getState().isOwner && <this.Students_Icon isAllContorl={store.getState().classroomInfo.allControl} />} 
        </span>
    }
 
    Students_Icon(props) {
        return (<> <div className='Student_permission_icon'>
            {props.isAllContorl && <img onMouseEnter={onOver} onMouseLeave={onLeave}  className="top_icon" data-des={GetLang('STUDENT_ALLCONTROL')} src="/dashboard/img/lock.png" />}
            {store.getState().permissions.screen && <img onMouseEnter={onOver} onMouseLeave={onLeave} className="top_icon" data-des={GetLang('STUDENT_SCREEN_SHARE')} id="student_screenshare" />}
            {store.getState().permissions.canvas && <img onMouseEnter={onOver} onMouseLeave={onLeave} className="top_icon" data-des={GetLang('STUDENT_CANVAS')} id="student_canvas" />}
            {store.getState().permissions.mic && <img onMouseEnter={onOver} onMouseLeave={onLeave} className="top_icon" data-des={GetLang('STUDENT_MIC')} id="student_mic" /> }
            </div>
            </>
        )
    }

    exitRoom() {
        reactEvent.AlertBox({
            title: GetLang('WARNING'),
            content: GetLang('EXIT_CONFIRM'),
            yes: function () {
                connection.extra.roomOwner && connection.send({ roomBoom: true })
                classroomManager.gotoMain();
            }
        })
    }
}
class CurrentTime extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startTime: 0,
            printTime: '00:00:00',
        }
    };

    render() {
        return <span className="time">
            <span id="current-time">{this.state.printTime}</span>
            <span id="recording-time">
                <img src="/dashboard/img/recording.png" style={{marginRight: '7px', marginBottom: '2px' }} />
                <span className="text"></span>
            </span>
        </span>
    }

    componentDidMount() {
        setInterval(() => {
            let now = new Date().getTime() - store.getState().classroomInfo.roomOpenTime;
            now = parseInt(now * 0.001);
            let time = now;
            let hour = Math.floor(time / 3600);
            time %= 3600;
            let min = Math.floor(time / 60);
            time %= 60;
            hour = ("00" + hour).slice(-2);
            min = ("00" + min).slice(-2);
            time = ("00" + time).slice(-2);
            if(isNaN(hour))
                return;
                
            let printTime = hour + ':' + min + ':' + time;
            this.setState({printTime})
        }, 1000);
    }
}
