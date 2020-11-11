var m_QuesCount = 0; // 현재 문제수
var m_ExamTimerInterval; // 시험 타이머 인터벌
var m_ExamTime; //


var examObj = {
    isStart: false,        // 현재 시험 중인지 아닌지 판단
    totalCount: 0,         // 시험 치는 인원
    questionCount: 0,      // 시험 문제수
    examTime: 0,          // 시험 시간(minute)    
    examAnswer: [],      // question 정답, 선생은 정답 저장, 학생은 자신이 선택한 정답 저장
    studentsAnswer: {},  // 학생들 정답 저장.
    submitStudents: {},    // 학생이 제출 했을 때, 최종 값
    endTime : 0
};

examObj.closeBoard = function() {
    widgetContainer.removeAttribute("style")
    $('#exam-board').hide(300, function () {
        classroomManager.canvasResize();
        rightTab.style.zIndex = 2;
    });
}

examObj.showBoard = function() {
    widgetContainer.style.right = "max(17.7%, 290px)";
    classroomManager.canvasResize();
    rightTab.style.zIndex = 0;
    $('#exam-omr').hide();
    $('#exam-teacher-menu').show();
    $('#exam-board').show(300);
}

examObj.closeTesting = function () {
    if (this.isStart) {
        return false;
    }

    connection.send({
        closeTesting: true
    });
    return true;
}

// 정답 확인.
examObj.checkAnswerCount = function (studentAnswers) {
    var len = examObj.examAnswer.length;
    if (studentAnswers.length != len) {
        console.error('문제와 답의 개수가 맞지 않습니다.');
        return '문제와 답의 개수가 맞지 않습니다.';
    }

    var equalCount = 0;
    for (var i = 0; i < len; ++i) {
        if (examObj.examAnswer[len] == studentAnswers[i])
            equalCount += 1;
    }
    return equalCount;
};

examObj.checkAnswer = function (_questionNumber, _answerNumber) {
    try {
        return examObj.examAnswer[_questionNumber] === _answerNumber;
    } catch (error) {
        console.error(`answer error ${error}`);
        return null;
    }
}

examObj.updateStudentAnswer = function (selectAnswer) {
    console.debug("updateStudentAnswer");

    var studentAnswerInfo = examObj.studentsAnswer[selectAnswer.userid];
    if (!studentAnswerInfo) {
        examObj.studentsAnswer[selectAnswer.userid] = {
            userid: selectAnswer.userid,   // 학생 아디
            name: selectAnswer.name,
            userAnswers: [],       // 학생이 선택한 번호
            answers: [],           // bool형. 현재 값이 정답인지 아닌지 미리 계산해서 저장.
            response: [],          // 학생의 문제 응답률.
            examState: 'on'        // 시험중 체크    
        };

        studentAnswerInfo = examObj.studentsAnswer[selectAnswer.userid];
    }

    var userAnswers = studentAnswerInfo.userAnswers;
    userAnswers[selectAnswer.questionNumber] = selectAnswer.answerNumber;
    studentAnswerInfo.answers[selectAnswer.questionNumber] = examObj.checkAnswer(selectAnswer.questionNumber, selectAnswer.answerNumber);
    if (!studentAnswerInfo.response[selectAnswer.questionNumber]) {
        if (null != selectAnswer.answerNumber)
            studentAnswerInfo.response[selectAnswer.questionNumber] = true;
    }
    classroomInfo.exam.studentAnswer[selectAnswer.userid] = examObj.studentsAnswer[selectAnswer.userid];
};

examObj.updateStudentAnswers = function (examAnswers) {
    let len = examAnswers.answers.length;
    for (let questionNumber = 0; questionNumber < len; ++questionNumber) {
        examObj.updateStudentAnswer({
            userid: examAnswers.userid,
            name: examAnswers.name,
            questionNumber: questionNumber,
            answerNumber: examAnswers.answers[questionNumber]
        });
    }
};

examObj.leftStudent = function (userid){
    if(examObj.isStart){
        delete examObj.studentsAnswer[userid];
        delete classroomInfo.exam.studentAnswer[userid];
    }
}

examObj.updateSubmitStudent = function (submitStudent) {
    console.log(submitStudent)
    var userid = submitStudent.userid;
    let date = new Date();
    student = examObj.studentsAnswer[userid];
    if (null == student.userAnswers)
        student.userAnswers = {};

    student.examState = 'submit';  // 시험 제출
    examObj.submitStudents[userid] = {
        userid: userid,
        name: student.name,
        userAnswers: student.userAnswers,
        answers: student.answers,
        time: date,
        score: 0
    };

    let score = 0;

    for (index in student.answers) {
        if (student.answers[index])
            ++score;
    }

    // 100점이 만점..백분률    
    let scoreRate = parseInt((score / examObj.questionCount) * 100);
    examObj.submitStudents[userid].score = scoreRate;
}

examObj.updateExamResponseStatisticsEach = function (_questionNumber) {
    const studentCounts = connection.peers.getLength();
    var responseCount = 0;
    for (id in examObj.studentsAnswer) {
        var student = examObj.studentsAnswer[id];
        if (student.response[_questionNumber] == true)
            responseCount += 1;
    }
    setExamState((_questionNumber + 1), (responseCount / studentCounts) * 100);
};

examObj.updateExamResponseStatistics = function () {

    // 통계값 갱신..
    const questionLen = examObj.questionCount;
    for (var currentQuestion = 0; currentQuestion < questionLen; ++currentQuestion) {
        examObj.updateExamResponseStatisticsEach(currentQuestion);
    }
};

examObj.updateExamAnswerStatisticsEach = function (_questionNumber) {
    const studentCounts = connection.peers.getLength();
    var answerCount = 0;
    for (id in examObj.studentsAnswer) {
        var student = examObj.studentsAnswer[id];
        if (student.answers[_questionNumber] == true)
            answerCount += 1;
    }
    setExamState((_questionNumber + 1), (answerCount / studentCounts) * 100);
};

examObj.updateExamAnswerStatistics = function () {
    const questionLen = examObj.questionCount;
    for (var currentQuestion = 0; currentQuestion < questionLen; ++currentQuestion) {
        examObj.updateExamAnswerStatisticsEach(currentQuestion);
    }
};

examObj.receiveExamData = function (_data) {

    if (_data.examStart) {
        let examStart = _data.examStart;
        console.log(examStart);
        examObj.isStart = true;
        examObj.questionCount = examStart.questionCount;
        examObj.examAnswer = {};
        examObj.endTime = examStart.examTime;

        setStudentOMR(examObj.questionCount, examObj.endTime);
    }
    else if (_data.examEnd) {
        if (examObj.isStart) {
            stopQuestionOMR();
            examObj.sendSubmit();
        }
    }
    else if (_data.examSelectAnswer) {
        examObj.receiveSelectExamAnswerFromStudent(_data.examSelectAnswer);
    }
    else if (_data.submit) {
        console.log(_data.submit)
        examObj.receiveSubmit(_data.submit);
    }
    else if (_data.submitResult) {
        examObj.receiveSubmitResult(_data.submitResult);
    }
};

examObj.checkAnswerChecked = function (_questionCount) {
    for (let i = 1; i <= _questionCount; ++i) {
        let checked = 1 == $(`input:radio[name='exam-question-${i}']:checked`).length;
        if (!checked)
            return false;
    }
    return true;
};

examObj.checkStudentAnswerChecked = function (_questionCount) {
    for (var i = 1; i <= _questionCount; i++) {
        let checked = 1 == $(`input:radio[name='exam-question-${i}']:checked`).length;
        if (!checked)
            return false;
    }
    return true;
};

examObj.setExamInfo = function () {

    examObj.examInfo = {
        testStudentCount: examObj.totalCount,
        questionCount: examObj.questionCount,
        examAnswer: examObj.examAnswer
    };
}

examObj.rejoin = function () {
    console.warn(classroomInfo.exam);
    examObj.isStart = true;

    if(connection.extra.roomOwner){
        examObj.showBoard();
        examObj.examAnswer = classroomInfo.exam.answer;
        examObj.questionCount = classroomInfo.exam.questionCount;

        $('#exam-setting-bar').hide();
        showExamStateForm(classroomInfo.exam.questionCount,classroomInfo.exam.endTime);
    }
    else{
        classroomInfo.exam.answer = {};
        setStudentOMR(classroomInfo.exam.questionCount,classroomInfo.exam.endTime);
        let data = classroomInfo.exam.studentAnswer[connection.extra.userFullName].userAnswers;
        if(data){
            console.log(data);  
            for(var i = 1 ; i <= data.length; i++){
                let answer = parseInt(data[i-1]);
                if(!answer)
                    continue;
                let line = $(`#exam-question-${i}`);
                let c = line.find(`input:radio[id='exam-question-${i}_${answer}']`).prop('checked', true); 
                omrChange(i);
            }
        }
    }
}

examObj.examClose = function () {
    examObj.isStart = false;
    examObj.studentsAnswer = {};
    examObj.examAnswer = {};
}

examObj.sendExamStart = function (_questionCount, _endTime) {
    examObj.questionCount = _questionCount;
    examObj.isStart = true;
    examObj.totalCount = connection.getAllParticipants().length;
    examObj.submitCount = 0;
    examObj.studentsAnswer = {};
    examObj.submitStudents = {};
    examObj.endTime = _endTime;

    examObj.setExamInfo();

    classroomInfo.exam = {
        state : true,   
        endTime : _endTime,
        answer : examObj.examAnswer,
        questionCount : examObj.questionCount,
        studentAnswer : {}
    }

    classroomManager.updateClassroomInfo();

    connection.send({
        exam: {
            examStart: {
                examTime: _endTime,
                questionCount: _questionCount
            }
        }
    });
}

examObj.sendExamEnd = function () {
    if (connection.extra.roomOwner) {
        if (!examObj.isStart)
            return;

        examObj.isStart = false;
        connection.send({
            exam: {
                examEnd: true
            }
        });
    }
}

examObj.sendSubmit = function () {
    examObj.isStart = false;
    connection.send({
        exam: {
            submit: {
                userid: connection.userid,
                name: params.userFullName,
                answers: examObj.examAnswer
            }
        }
    });
};

examObj.sendSelectExamAnswerToTeacher = function (_questionNumber, _answerNumber) {
    connection.send({
        exam: {
            examSelectAnswer: {
                userid: connection.userid,
                name: params.userFullName,
                questionNumber: (_questionNumber - 1), // 번호가 1번부터 할당되기 때문에 -1을 하였다.
                answerNumber: _answerNumber
            }
        }
    }, GetOwnerId());
};

//선생님이 학생에게 채점 결과를 보내준다.
examObj.sendResultToStudent = function (_studentId) {
    if (connection.extra.roomOwner) {
        const submit = examObj.submitStudents[_studentId];

        connection.send({
            exam: {
                submitResult: {
                    userid: _studentId,
                    score: submit.score,
                    name: submit.name,
                    userAnswers: submit.userAnswers,
                    examAnswers: examObj.examAnswer
                }
            }
        });
    }
}

examObj.receiveSelectExamAnswerFromStudent = function (selectAnswer) {
    // 학생으로부터 정답 받았을 때, 처리

    examObj.updateStudentAnswer({
        userid: selectAnswer.userid,
        name: selectAnswer.name,
        questionNumber: selectAnswer.questionNumber,
        answerNumber: selectAnswer.answerNumber
    });
    
    examObj.updateExamAnswerStatisticsEach(selectAnswer.questionNumber); // 정답률
};

examObj.receiveSubmit = function (submit) {
    if (connection.extra.roomOwner) {
        examObj.updateSubmitStudent(submit);
        examObj.updateExamAnswerStatistics();
        examObj.submitCount += 1;
        examObj.sendResultToStudent(submit.userid);
    }
};

examObj.receiveSubmitResult = function (_examResult) {
    if (connection.userid == _examResult.userid) {
        const len = _examResult.examAnswers.length;
        for (let i = 0; i < len; ++i) {
            const questionNumber = i + 1;
            const examAnswer = _examResult.examAnswers[i];
            const studentAnswer = _examResult.userAnswers[i];

            markStudent(questionNumber, studentAnswer, examAnswer)
        }
    }
};

examObj.exportExam = function () {
    if (connection.extra.roomOwner) {
        let now = new Date();
        const excelFileName = `${now}.xlsx`;
        const sheetName = connection.sessionid;

        const workData = getSubmitData();

        // step 1. workbook 생성
        var wb = XLSX.utils.book_new();

        // step 3. workbook에 새로만든 워크시트에 이름을 주고 붙인다.  
        XLSX.utils.book_append_sheet(wb, workData, sheetName);

        // step 4. 엑셀 파일 만들기 
        var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

        // step 5. 엑셀 파일 내보내기 
        saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), excelFileName);
    }

    // export excel data
    function getSubmitData() {
        var contents = [];
        contents[0] = [$.i18n('NAME'), $.i18n('SCORE')];   // 타이틀        
        // id, answer, 
        let prefix = contents[0].length;
        for (var i = 0; i < examObj.questionCount; ++i) {
            contents[0][i + prefix] = `${i + 1}`;
        }

        var row = 1;
        for (id in examObj.submitStudents) {
            const submit = examObj.submitStudents[id];
            var content = contents[row];
            content = [submit.name];
            content[1] = submit.score;

            var answerCount = 2;
            for (answerIndex in submit.answers) {
                let resuslt = submit.answers[answerIndex];
                let data = '';
                if (resuslt) {
                    data = `{O} - ${submit.userAnswers[answerIndex]}`;

                } else {
                    data = `{X} - ${submit.userAnswers[answerIndex]}`;
                }
                content[answerCount++] = data;
            }


            contents[row] = content;
            row += 1;
        }
        return XLSX.utils.aoa_to_sheet(contents);
    };

    function s2ab(s) {
        var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
        var view = new Uint8Array(buf);  //create uint8array as viewer
        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
        return buf;
    }
};

// 문제 html에 하나 추가 (apeend)
function apeendQuestion(i) {
    question = `<div id='exam-question-${i}' style='display: flex;'>`;
    question += `<span id='exam-question-text-${i}' class='text-center-bold' style='line-height: 43px; width:30px; text-align:right;'>${i}.</span>`;
    for (var j = 1; j <= 5; j++) {
        question += `<input type='radio' id='exam-question-${i}_${j}' name='exam-question-${i}' value='${j}'> `;
        question += `<label for='exam-question-${i}_${j}' style='flex:1;'>${j}</label>`;
    }
    question += `<button id='exam-question-delete-${i}' onclick='deleteQuestion(${i})' class='btn btn-exam text-center-bold' style='flex:1; padding: 0px 3px 3px 3px; margin:12px; height:20px; line-height:12px'>─</button>`;
    question += `</div>`;
    $('#exam-question-list').append(question);
    $(`#exam-question-${i}`).change(function () {
        $(`#exam-question-${i}`).css('background', '#eff1f0');
    });
}

// 문제 하나 제거
function deleteQuestion(num) {
    var answerList = getQuestionAnswerList();
    m_QuesCount--;
    answerList.splice(num - 1, 1);
    $('#exam-question-list').html('');
    for (var i = 1; i <= m_QuesCount; i++) {
        apeendQuestion(i);
    }
    setQuestionAnswer(answerList);
    $('#exam-question-count').val(m_QuesCount);
}

// 시험 문제 하나의 정답률 변경 / 형식 -> (문제번호, 문제정답수/학생수)
function setExamState(num, percent) {
    $(`#exam-state-progress-${num}`).val(percent);
    $(`#exam-state-percent-${num}`).html(Math.round(percent) + '%');
}

// 문제 정답 불러오기
function getQuestionAnswerList() {
    var checkList = new Array();
    for (var i = 1; i <= m_QuesCount; i++) {
        checkList.push($(`input:radio[name='exam-question-${i}']:checked`).val());
    }
    return checkList;
}

// 문제 정답 세팅
function setQuestionAnswer(answerList) {
    for (let i = 1; i <= m_QuesCount; i++) {
        $(
            `input:radio[name='exam-question-${i}'][value=${answerList[i - 1]}]`
        ).prop('checked', true);
        if ($(`input:radio[name='exam-question-${i}']`).is(':checked')) {
            $(`#exam-question-${i}`).css('background', '#eff1f0');
        }
    }
}

// 학생들 OMR 세팅
function setStudentOMR(quesCount, examTime) {
    rightTab.style.zIndex = 0;

    if (mobileHelper.isMobile) {
        widgetContainer.style.right = "max(0px, 290px)";
    }
    else {
        widgetContainer.style.right = "max(17.7%, 290px)";
    }
    classroomManager.canvasResize();

    $('#exam-omr').show();
    $('#exam-board').show();
    $('#exam-omr').html('');
    var question = '';

    question += "<div class='exam-header'>";
    question += "<div id='is-testing'>" + $.i18n('QUIZ_ON') + "</div>";
    question += "<div id='exam-student-timer' style='color:red;'>0:0</div>";
    question += '</div>';
    question += "<div class='exam-overflow exam-border-bottom'>";
    question += "<div id='exam-omr-question-list'>";
    m_QuesCount = quesCount;
    for (var i = 1; i <= m_QuesCount; i++) {
        question += `<div id='exam-question-${i}' style='display:flex;' onchange='omrChange(${i})'>`;
        question += `<span id='exam-question-text-${i}' class='text-center-bold' style='line-height: 43px; width:30px; text-align:right;'>${i}.</span>`;
        for (var j = 1; j <= 5; j++) {
            question += `<input type='radio' id='exam-question-${i}_${j}' style='flex:5;' name='exam-question-${i}' value='${j}'> `;
            question += `<label for='exam-question-${i}_${j}'>${j}</label>`;
        }
        question += `<span id='exam-student-answer-${i}' class='text-center-bold' style='flex:1; line-height: 43px;'></span>`;
        question += `</div>`;
    }
    question += '</div>';
    question += `</div>`;
    question +=
        "<button onclick='submitOMR()' id='exam-answer-submit' class='btn btn-exam exam-80-button' onclick='finishExam()'>" + $.i18n('QUIZ_SUBMIT') + "</button>";
    $('#exam-omr').html(question);

    let time = examTime;
    time -= new Date().getTime() / 1000;
    time = Math.floor(time);

    $('#exam-student-timer').html(getFormatmmss(time));
    m_ExamTimerInterval = setInterval(function () {
        let time = examTime;
        time -= new Date().getTime() / 1000;
        time = Math.floor(time);
        $('#exam-student-timer').html(getFormatmmss(time));
        if (time <= 0){
            finishExam();
        }
    }, 1000);
}

// 학생 시험 OMR 제출
function submitOMR() {
    if (!examObj.checkStudentAnswerChecked(m_QuesCount)) {
        alert($.i18n('QUIZ_SUBMIT_WARNING'));
        return;
    }

    stopQuestionOMR();
    examObj.sendSubmit();
}

function stopQuestionOMR() {
    clearInterval(m_ExamTimerInterval);
    let studentOMR = getQuestionAnswerList();
    examObj.examAnswer = studentOMR;
    $('#is-testing').html($.i18n('QUIZ_END'));
    $('#exam-omr-question-list').css('pointer-events', 'none');
    $('#exam-answer-submit').hide();
}

// 학생 정답 표시
function markStudent(num, check, answer) {
    check === answer ? $(`#exam-question-${num}`).css('background-color', '#92ecc8') :
                       $(`#exam-question-${num}`).css('background-color', '#fbccc4');
    $(`#exam-student-answer-${num}`).html("(" + answer + ")");
}

// 학생 OMR이 변경됨
function omrChange(num) {
    $(`#exam-question-${num}`).css('background', '#eff1f0');
    let questionNumber = num;
    let answerNumber = $(
        `input:radio[name='exam-question-${num}']:checked`
    ).val();
    examObj.sendSelectExamAnswerToTeacher(questionNumber, answerNumber);
}

function finishExam() {
    console.debug("Finish exam");
    clearInterval(m_ExamTimerInterval);
    classroomInfo.exam = { state : false }
    classroomManager.updateClassroomInfo();
    document.getElementById("exam-time").value = 0;
    $('#exam-setting-bar').show();
    $('#exam-state').html('');
    examObj.sendExamEnd();
    examObj.exportExam();

}

// 시험 문제 정답률 폼 표시
function showExamStateForm(quesCount, endTime) {
    $('#exam-state').show();
    let stateHtmlStr = '';

    stateHtmlStr += "<div class='exam-header'>";
    stateHtmlStr += '<div>' + $.i18n('QUIZ_ON') + '</div>';
    stateHtmlStr += "<div id='exam-teacher-timer' style='color:red;'>0:0</div>";
    stateHtmlStr += '</div>';
    stateHtmlStr += "<div class='exam-background exam-overflow'>";
    for (let i = 1; i <= quesCount; i++) {
        stateHtmlStr += `<div style='display:flex; height:37px;'>`;
        stateHtmlStr += `<span class='exam-state-progress-number'>${i}.</span>`;
        stateHtmlStr += `<progress style='margin-top:16px; margin-left:13px; width:240px;' id="exam-state-progress-${i}" class='exam-state-progress'  value="0" max="100"></progress>`;
        stateHtmlStr += `<span class='exam-state-percent'  id='exam-state-percent-${i}'>0%</span><br>`;
        stateHtmlStr += `</div>`;
    }
    stateHtmlStr += '</div>';
    stateHtmlStr +=
        "<button id='exam-finish' class='btn btn-danger exam-80-button' onclick='finishExam()'>" + $.i18n('QUIZ_END') + "</button>";

    $('#exam-state').html(stateHtmlStr);

            
    let time = endTime ;
    time -= new Date().getTime() / 1000;
    time = Math.floor(time);
    $('#exam-teacher-timer').html(getFormatmmss(time));
    m_ExamTimerInterval = setInterval(function () {
        let time = endTime;
        time -= new Date().getTime() / 1000;
        time = Math.floor(time);
        $('#exam-teacher-timer').html(getFormatmmss(time));
        if (time <= 0)
            finishExam();
    }, 1000);
}

function getFormatmmss(sec) {
    let min = ("00" + Math.floor(sec / 60)).slice(-2);
    let second = ("00" + Math.floor(sec % 60)).slice(-2);
    
    return min + ":" + second;
}

function numberPad(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}