class ExamIcon extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <img onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave} className="top_icon" id="top_test" onClick={this.clickHandler} data-des={GetLang('TOP_QUIZ')} />
    }

    clickHandler() {
        if ($('#exam-board').is(':visible')) {
            !examObj.closeTesting() && alert(window.langlist.QUIZ_END_WARNING);
        }
        else {
            examObj.showBoard();
        }
    }
}

class Exam extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            examCount: '',
            examTime: '',
            endTime: '',
            inSetting: true,
        }

        this.onQCountHandler    = this.onQCountHandler.bind(this);
        this.onExamTimeHandler  = this.onExamTimeHandler.bind(this);
        this.onStartExam        = this.onStartExam.bind(this);
        this.finishExam         = this.finishExam.bind(this);
    }

    render() {
        return <div id="exam-board" className="scroll">

            {store.getState().isOwner ?
            
                <div>
                    {this.state.inSetting ?
                        <ExamSettingForm
                            onStartExam={this.onStartExam}
                            onQCountHandler={this.onQCountHandler}
                            onExamTimeHandler={this.onExamTimeHandler}
                            state={this.state} /> :
                        <ExamStateForm
                            endTime={this.state.endTime}
                            finishExam={this.finishExam}
                            cnt={this.state.examCount}
                        />
                    }
                </div> :
                <OMRForm />
            }

        </div>
    }

    onStartExam() {
        let endTime = (new Date().getTime() + (this.state.examTime * 60 * 1000)) / 1000;
        examObj.examAnswer = getQuestionAnswerList(this.state.examCount);
        examObj.sendExamStart(this.state.examCount, endTime);
        
        this.setState({
            inSetting: !this.state.inSetting,
            endTime
        })
    }

    onQCountHandler(e) {
        this.setState({
            examCount: Math.max(0, Math.min(e.target.value, 200))
        })
    }

    onExamTimeHandler(e) {
        let examTime = Math.max(0, Math.min(e.target.value, 240))
        this.setState({examTime})
    }

    finishExam(){
        console.debug("Finish exam");
        clearInterval(m_ExamTimerInterval);
        classroomInfo.exam = { state : false }
        classroomManager.updateClassroomInfo();
        examObj.sendExamEnd();
        examObj.exportExam();
        this.setState({inSetting: !this.state.inSetting})
    }
}

class ExamSettingForm extends React.Component {

    render() {
        const questionList = [];

        for (let i = 0; i < this.props.state.examCount; i++)
            questionList.push(<Question idx={i + 1} key={i} />);


        return <div>
            <div id="exam-title" className="exam-border-bottom">{GetLang('QUIZ_CREATE')}</div>
            <div className="exam-border-bottom exam-border-setting-form">
                <label className="exam-question-count-label" htmlFor="exam-question-count">{GetLang('QUIZ_NUM')}</label>
                <input className="exam-question-count" value={this.props.state.examCount} onChange={this.props.onQCountHandler} type="number" />
                <label className="exam-time-label" htmlFor="exam-time">{GetLang('QUIZ_TIME')}</label>
                <input className="exam-time" value={this.props.state.examTime} onChange={this.props.onExamTimeHandler} type="number" placeholder={GetLang('QUIZ_MINUTES')} />
            </div>
            <div id="exam-question-list" className="exam-border-bottom exam-overflow" style={{ textAlign: 'center' }}>
                {questionList}
            </div>
            <ExamStartButton onStartExam={this.props.onStartExam} examCount={this.props.state.examCount} examTime={this.props.state.examTime} />
        </div>
    }
}

class ExamStateForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            time: 0,
            startTime : 0,
        }
    }

    componentDidMount() {
        this.startTime = this.props.endTime ;
        let time = this.startTime;
        time -= new Date().getTime() / 1000;
        time = getFormatmmss(Math.floor(time));
        this.setState({time})

        this.interval = setInterval(() => {
            let time = this.startTime;
            time -= new Date().getTime() / 1000;
            time = getFormatmmss(Math.floor(time));
            this.setState({time})
            time <= 0 && this.props.finishExam();
        }, 1000);
    }

    componentWillUnmount(){
        clearInterval(this.interval);
    }

    render() {
        const list = [];
        for (let i = 1; i <= this.props.cnt; i++) {
            list.push(<this.State cnt={i} key={i} />)
        }
        return (<>
            <div className='exam-header'>
                <div>{GetLang('QUIZ_ON')}</div>
                <div style={{ color: 'red' }}>{this.state.time}</div>
            </div>
            <div className='exam-background exam-overflow'>
                {list}
            </div>
            <button id='exam-finish'
                className='btn btn-danger exam-80-button'
                onClick={this.props.finishExam}>{GetLang('QUIZ_END')}</button>
        </>)
    }

    State(props) {
        return (<div className='line'>
            <span className='exam-state-progress-number'>{props.cnt}.</span>
            <progress
                id={"exam-state-progress-" + props.cnt}
                className='exam-state-progress'
                value="0"
                max="100" />
            <span className='exam-state-percent' id={'exam-state-percent-' + props.cnt}>0%</span>
            <br />
        </div>)
    }
}

class OMRForm extends React.Component {
    render(){
        return <div id="exam-omr">
            {/* <div className="exam-header">
                <div id='is-testing'>
                    {GetLang('QUIZ_ON')}
                </div>
                <div style={{color:'red'}} id='exam-student-timer'></div>
            </div>

            <div className={}></div> */}
        </div>;
    }
}

function ExamStartButton(props) {
    let e = function () {
        if (props.examCount <= 0) {
            alert(window.langlist.QUIZ_FILL_ERROR);
            return;
        }

        if (!examObj.checkAnswerChecked(props.examCount)) {
            alert(window.langlist.QUIZ_ANSWER_ERROR);
            return;
        }

        if (props.examTime <= 0) {
            alert(window.langlist.QUIZ_TIME_ERROR);
            return;
        }
        props.onStartExam();
    }

    return <button onClick={e} className="btn btn-exam exam-80-button">{GetLang('QUIZ_START')}</button>
}

function Question(props) {
    const buttons = [];
    for (let i = 1; i <= 5; i++) {
        buttons.push(<span key={i}>
            <input type="radio" id={"exam-question-" + props.idx + "_" + i} name={"exam-question-" + props.idx} value={i} />
            <label htmlFor={"exam-question-" + props.idx + "_" + i}>{i}</label>
        </span>)
    }

    return <div id={"exam-question-" + props.idx} className='question'>
        <span id="exam-question-text-1" className="text-center-bold line">{props.idx}.</span>
        {buttons}
    </div>
}