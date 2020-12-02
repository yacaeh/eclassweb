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


examObj.showBoard = function() {
    widgetContainer.style.right = "max(17.7%, 290px)";
    classroomManager.canvasResize();
    rightTab.style.zIndex = 0;
    $('#exam-board').show(300);
}

examObj.closeBoard = function(){
    $('#exam-board').hide(300, function () {
        classroomManager.canvasResize();
        rightTab.style.zIndex = 2;
    });
}

examObj.closeTesting = function () {
    if (this.isStart) {
        return false;
    }

    connection.send({closeTesting: true});
    widgetContainer.removeAttribute("style")
    examObj.closeBoard();
    return true;
}

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
    if(submitStudent.name == 'ycsadmin')
        return;

    var userid = submitStudent.userid;
    let date = new Date();
    student = examObj.studentsAnswer[userid];
    if (student && null == student.userAnswers)
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

examObj.rejoin = function () {
    console.warn(classroomInfo.exam);
    examObj.isStart = true;

    if(connection.extra.roomOwner){
        examObj.showBoard();
        examObj.examAnswer = classroomInfo.exam.answer;
        examObj.questionCount = classroomInfo.exam.questionCount;
    }
    else{
        classroomInfo.exam.answer = {};
        setStudentOMR(classroomInfo.exam.questionCount,classroomInfo.exam.endTime);
        // let data = classroomInfo.exam.studentAnswer[connection.extra.userFullName].userAnswers;
        // if(data){
        //     console.log(data);  
        //     for(var i = 1 ; i <= data.length; i++){
        //         let answer = parseInt(data[i-1]);
        //         if(!answer)
        //             continue;
        //         let line = $(`#exam-question-${i}`);
        //         let c = line.find(`input:radio[id='exam-question-${i}_${answer}']`).prop('checked', true); 
        //         omrChange(i);
        //     }
        // }
    }
}

examObj.sendExamStart = function (_questionCount, _endTime) {
    console.log("SEND",_questionCount,_endTime)
    examObj.questionCount = _questionCount;
    examObj.isStart = true;
    examObj.totalCount = connection.getAllParticipants().length;
    examObj.submitCount = 0;
    examObj.studentsAnswer = {};
    examObj.submitStudents = {};
    examObj.endTime = _endTime;
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

examObj.sendResultToStudent = function (_studentId) {
    if (connection.extra.roomOwner) {
        const submit = examObj.submitStudents[_studentId];
        if(submit)
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
        contents[0] = [window.langlist.NAME, window.langlist.SCORE];   // 타이틀        
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
                content[answerCount++] = submit.answers[answerIndex] ? 
                `{O} - ${submit.userAnswers[answerIndex]}` : 
                `{X} - ${submit.userAnswers[answerIndex]}`;
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


// 시험 문제 하나의 정답률 변경 / 형식 -> (문제번호, 문제정답수/학생수)
function setExamState(num, percent) {
    $(`#exam-state-progress-${num}`).val(percent);
    $(`#exam-state-percent-${num}`).html(Math.round(percent) + '%');
}

// 문제 정답 불러오기
function getQuestionAnswerList(num) {
    var checkList = new Array();
    num = num || m_QuesCount;
    for (var i = 1; i <= num; i++) {
        checkList.push($(`input:radio[name='exam-question-${i}']:checked`).val());
    }
    return checkList;
}

// 학생들 OMR 세팅
function setStudentOMR(quesCount, examTime) {
    // store.dispatch({ 
    //     type: EXAM_CHANGED, 
    //     data: {
    //         state : true,
    //         quesCount, 
    //         examTime
    //     }});


    console.log(quesCount,examTime)
    $('#exam-board').show();
    rightTab.style.zIndex = 0;

    widgetContainer.style.right = store.getState().isMobile ? "max(0px, 290px)" : "max(17.7%, 290px)" ;
    classroomManager.canvasResize();

    // $('#exam-omr').html('');

    var question = '';
    question += "<div class='exam-header'>";
    question += "<div id='is-testing'>" + window.langlist.QUIZ_ON + "</div>";
    question += "<div id='exam-student-timer' style='color:red;'>0:0</div>";
    question += '</div>';

    question += "<div class='exam-overflow exam-border-bottom'>";
    question += "<div id='exam-omr-question-list'>";
    m_QuesCount = quesCount;
    for (var i = 1; i <= m_QuesCount; i++) {
        question += `<div id='exam-question-${i}' class="question" onchange='omrChange(${i})'>`;
        question += `<span id='exam-question-text-${i}' class='text-center-bold' style='line-height: 43px; width:30px; text-align:right;'>${i}.</span>`;
        for (var j = 1; j <= 5; j++) {
            question += `<input type='radio' id='exam-question-${i}_${j}' name='exam-question-${i}' value='${j}'> `;
            question += `<label for='exam-question-${i}_${j}'>${j}</label>`;
        }
        question += `<span id='exam-student-answer-${i}' class='text-center-bold' style='flex:1; line-height: 43px;'></span>`;
        question += `</div>`;
    }
    question += '</div>';
    question += `</div>`;
    question +=
        "<button onclick='submitOMR()' id='exam-answer-submit' class='btn btn-exam exam-80-button'>" + window.langlist.QUIZ_SUBMIT + "</button>";
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
        alert(window.langlist.QUIZ_SUBMIT_WARNING);
        return;
    }

    stopQuestionOMR();
    examObj.sendSubmit();
}

function stopQuestionOMR() {
    clearInterval(m_ExamTimerInterval);
    let studentOMR = getQuestionAnswerList();
    examObj.examAnswer = studentOMR;
    $('#is-testing').html(window.langlist.QUIZ_END);
    $('#exam-omr-question-list').css('pointer-events', 'none');
    $('#exam-answer-submit').hide();
}

// 학생 정답 표시
function markStudent(num, check, answer) {
    check === answer ? $(`#exam-question-${num}`).css('background-color', '#92ecc8').addClass('grid_7'):
                       $(`#exam-question-${num}`).css('background-color', '#fbccc4').addClass('grid_7');
    $(`#exam-student-answer-${num}`).html("(" + answer + ")");
}

// 학생 OMR이 변경됨
function omrChange(num) {
    $(`#exam-question-${num}`).css('background', '#eff1f0');
    let questionNumber = num;
    let answerNumber = $(`input:radio[name='exam-question-${num}']:checked`).val();
    examObj.sendSelectExamAnswerToTeacher(questionNumber, answerNumber);
}

function finishExam() {
    console.debug("Finish exam");
    clearInterval(m_ExamTimerInterval);
    classroomInfo.exam = { state : false }
    classroomManager.updateClassroomInfo();
    examObj.sendExamEnd();
    examObj.exportExam();
}

function getFormatmmss(sec) {
    let min = ("00" + Math.floor(sec / 60)).slice(-2);
    let second = ("00" + Math.floor(sec % 60)).slice(-2);
    return min + ":" + second;
}