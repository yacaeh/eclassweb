class ExamIcon extends React.Component {
    render() {
        return <img className="top_icon" id="top_test" onClick={this.clickHandler} />
    }

    clickHandler() {
        if ($('#exam-board').is(':visible')) {
            examObj.closeTesting() ? examObj.closeBoard() : alert($.i18n('QUIZ_END_WARNING'));
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
                    <div id="exam-title" className="exam-border-bottom" data-i18n="QUIZ_CREATE" />
                    <div style={{ display: 'flex', width: '100%', height: '37px', background: '#EFF1F0' }} className="exam-border-bottom">
                        <label id="exam-question-count-label" htmlFor="exam-question-count" data-i18n="QUIZ_NUM" />
                        <input id="exam-question-count" type="number" />
                        <label id="exam-time-label" htmlFor="exam-time" data-i18n="QUIZ_TIME" />
                        <input id="exam-time" type="text" />
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
            alert($.i18n('QUIZ_FILL_ERROR'));
            return;
        }

        if (!examObj.checkAnswerChecked(m_QuesCount)) {
            alert($.i18n('QUIZ_ANSWER_ERROR'));
            return;
        }

        const examTime = document.getElementById("exam-time").value;

        if (examTime <= 0 || isNaN(examTime)) {
            alert($.i18n('QUIZ_TIME_ERROR'));
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

    return <button onClick={e} id="exam-start" className="btn btn-exam exam-80-button" data-i18n="QUIZ_START" />
}

function ExamSettingApply() {
    function e() {
        m_QuesCount = document.getElementById('exam-question-count').value;
        if (m_QuesCount > 200) {
            alert($.i18n('QUIZ_MAX_ERROR'));
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

    return <button onClick={e} id="exam-setting-apply" className="btn btn-exam" data-i18n="QUIZ_SETTING"><b>설정</b></button>
}