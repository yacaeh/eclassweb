class ExamIcon extends React.Component {
    constructor(props){
        super(props);
    }

    render() {
        return <img onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave} className="top_icon" id="top_test" onClick={this.clickHandler} data-des={GetLang('TOP_QUIZ')}/>
    }

    clickHandler() {
        if ($('#exam-board').is(':visible')) {
            examObj.closeTesting() ? examObj.closeBoard() : alert(window.langlist.QUIZ_END_WARNING);
        }
        else {
            examObj.showBoard();
        }
    }
}

class Exam extends React.Component {
    state = {
        examCount : 0
    }

    constructor(props) {
        super(props);
    }

    render() {
        return <div id="exam-board" className="scroll">
            <div id="exam-teacher-menu" style={{ display: 'none' }} >
                <div id="exam-setting-bar">
                    <div id="exam-title" className="exam-border-bottom">{GetLang('QUIZ_CREATE')}</div>
                    <div style={{ display: 'flex', width: '100%', height: '37px', background: '#EFF1F0' }} className="exam-border-bottom">
                        <label id="exam-question-count-label" htmlFor="exam-question-count">{GetLang('QUIZ_NUM')}</label>
                        <input id="exam-question-count" type="number" />
                        <label id="exam-time-label" htmlFor="exam-time">{GetLang('QUIZ_TIME')}</label>
                        <input id="exam-time" type="text" placeholder={GetLang('QUIZ_MINUTES')} />
                        <ExamSettingApply />
                    </div>
                    <div id="exam-question-list" className="exam-border-bottom exam-overflow" style={{ textAlign: 'center' }} />
                    <ExamStartButton />
                </div>
                <div id="exam-state" style={{ display: 'none' }} />
            </div>
            <div id="exam-omr" style={{ display: 'none' }} />
        </div>
    }
}

function ExamStartButton() {
    function e() {
        if (m_QuesCount <= 0) {
            alert(window.langlist.QUIZ_FILL_ERROR);
            return;
        }

        if (!examObj.checkAnswerChecked(m_QuesCount)) {
            alert(window.langlist.QUIZ_ANSWER_ERROR);
            return;
        }

        const examTime = document.getElementById("exam-time").value;

        if (examTime <= 0 || isNaN(examTime)) {
            alert(window.langlist.QUIZ_TIME_ERROR);
            return;
        }

        m_ExamTime = document.getElementById("exam-time").value;
        let endTime = (new Date().getTime() + (m_ExamTime * 60 * 1000)) / 1000;
        var answerList = getQuestionAnswerList();
        examObj.examAnswer = answerList;
        examObj.sendExamStart(m_QuesCount, endTime);

        $('#exam-setting-bar').hide();
        showExamStateForm(m_QuesCount, endTime);
    }

    return <button onClick={e} id="exam-start" className="btn btn-exam exam-80-button">{GetLang('QUIZ_START')}</button>
}

function ExamSettingApply() {
    function e() {
        m_QuesCount = document.getElementById('exam-question-count').value;
        if (m_QuesCount > 200) {
            alert(window.langlist.QUIZ_MAX_ERROR);
            m_QuesCount = 200;
            document.getElementById('exam-question-count').value = m_QuesCount;
        }
        var answerList = getQuestionAnswerList();
        document.getElementById("exam-question-list").innerHTML = '';
        for (var i = 1; i <= m_QuesCount; i++) {
            apeendQuestion(i);
        }

        setQuestionAnswer(answerList);
    };

    return <button onClick={e} id="exam-setting-apply" className="btn btn-exam" ><b>{GetLang('QUIZ_SETTING')}</b></button>
}