var m_QuesCount = 0; // 현재 문제수
var m_ExamTimerInterval; // 시험 타이머 인터벌
var m_ExamTime; //


var examObj = {
    isStart: false,        // 현재 시험 중인지 아닌지 판단
    totalCount: 0,         // 시험 치는 인원
    questionCount: 0,      // 시험 문제수
    currentExamTime: 0,   // 현재 시험 남은 시간
    examTime: 0,          // 시험 시간(minute)    
    examAnswer: [],      // question 정답, 선생은 정답 저장, 학생은 자신이 선택한 정답 저장
    studentsAnswer: {},  // 학생들 정답 저장.
    submitStudents: {}    // 학생이 제출 했을 때, 최종 값
};

examObj.init = function(){
    SettingForExam();

    AddEvent("top_test", "click" ,function(){
        if ($('#exam-board').is(':visible')) {
          if (examObj.closeTesting()) {
            widgetContainer.removeAttribute("style")
            $('#exam-board').hide(300,function(){
                rightTab.style.zIndex = 3;
            });
          } else {
            alert($.i18n('QUIZ_END_WARNING'));
          }
        }
        else {
          // 선생님
          if (params.open === 'true') {
            widgetContainer.style.right = "max(17.7%, 290px)";
            classroomManager.canvasResize();
            $('#exam-omr').hide();
            $('#exam-teacher-menu').show();
            rightTab.style.zIndex = -1;
          }
          $('#exam-board').show(300);
        }
    })
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
    // 학생의 시험 답 하나를 갱싱한다.
    var studentAnswerInfo = examObj.studentsAnswer[selectAnswer.userid];
    if (!studentAnswerInfo) {
        // studentAnswer가 없다면 새로 만들어 준다.
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
};

examObj.updateStudentAnswers = function (examAnswers) {
    //  학생의 시험 답 전체를 갱신한다.
    var len = examAnswers.answers.length;
    for (var questionNumber = 0; questionNumber < len; ++questionNumber) {
        examObj.updateStudentAnswer({
            userid: examAnswers.userid,
            name: examAnswers.name,
            questionNumber: questionNumber,
            answerNumber: examAnswers.answers[questionNumber]
        });
    }
};

examObj.updateSubmitStudent = function (submitStudent) {
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
    //const studentCounts = connection.getAllParticipants().length;
    const studentCounts = examObj.totalCount;
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
    const studentCounts = examObj.totalCount;
    var answerCount = 0;
    for (id in examObj.studentsAnswer) {
        var student = examObj.studentsAnswer[id];
        if (student.answers[_questionNumber] == true)
            answerCount += 1;
    }
    setExamState((_questionNumber + 1), (answerCount / studentCounts) * 100);
};

examObj.updateExamAnswerStatistics = function () {

    // 통계값 갱신..
    const questionLen = examObj.questionCount;
    for (var currentQuestion = 0; currentQuestion < questionLen; ++currentQuestion) {
        examObj.updateExamAnswerStatisticsEach(currentQuestion);
    }
};

examObj.updateExameTimer = function (_currentExamTimer) {
    examObj.currentExamTime = _currentExamTimer;
}

examObj.receiveExamData = function (_data) {

    if (_data.examStart) {
        classroomInfo.exam = true;
        let examStart = _data.examStart;
        examObj.isStart = true;
        examObj.examTime = examStart.examTime;
        examObj.currentExamTime = examStart.examTime;
        examObj.questionCount = examStart.questionCount;
        examObj.examAnswer = {};

        setStudentOMR(examObj.questionCount, examObj.examTime);
    }
    else if (_data.examEnd) {
        // 시험 종료
        if (examObj.isStart) {
            classroomInfo.exam = false;

            // 학생들 시험 제출.   
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
        //   시험 제출에 대한 결과
        examObj.receiveSubmitResult(_data.submitResult);
    }
};

//  시험지 모든 문제에 체크를 했는지 확인. 
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
        examTime: examObj.examTime,
        examAnswer: examObj.examAnswer
    };
}

examObj.examClose = function () {

    examObj.exportExam();
    classroomInfo.exam = false;
    examObj.isStart = false;
    examObj.studentsAnswer = {};
    examObj.examAnswer = {};

}

examObj.sendExamStart = function (_questionCount, _examTime) {
    if (connection.extra.roomOwner) {
        classroomInfo.exam = true;
        examObj.questionCount = _questionCount;
        examObj.isStart = true;
        examObj.totalCount = connection.getAllParticipants().length;
        examObj.examTime = _examTime;
        examObj.submitCount = 0;
        examObj.studentsAnswer = {};
        examObj.submitStudents = {};

        examObj.setExamInfo();

        connection.send({
            exam: {
                examStart: {
                    examTime: examObj.examTime,
                    questionCount: examObj.questionCount
                }
            }
        });
    }
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
    //  학생이 선생한테 정답 제출
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
    //
    connection.send({
        exam: {
            examSelectAnswer: {
                userid: connection.userid,
                name: params.userFullName,
                questionNumber: (_questionNumber - 1), // 번호가 1번부터 할당되기 때문에 -1을 하였다.
                answerNumber: _answerNumber
            }
        }
    });
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
    if (connection.extra.roomOwner) {
        examObj.updateStudentAnswer({
            userid: selectAnswer.userid,
            name: selectAnswer.name,
            questionNumber: selectAnswer.questionNumber,
            answerNumber: selectAnswer.answerNumber
        });

        examObj.updateExamAnswerStatisticsEach(selectAnswer.questionNumber); // 정답률
        // examObj.updateExamResponseStatisticsEach (selectAnswer.questionNumber); // 응답률
    }
};

examObj.receiveSubmit = function (submit) {
    // 학생 정답 확인.
    if (connection.extra.roomOwner) {
        examObj.updateStudentAnswers(submit);  // 최신 기록 저장,     
        examObj.updateSubmitStudent(submit);
        examObj.updateExamAnswerStatistics();
        examObj.submitCount += 1;

        // sendResult        
        examObj.sendResultToStudent(submit.userid);

        if (examObj.totalCount == examObj.submitCount)   // 마지막 제출이 끝났을 때, 결과를 export 한다.
        {
            // 시험 종료.
            finishExam();
            examObj.examClose();
        }
    }
};

examObj.receiveSubmitResult = function (_examResult) {
    // 시험 정답 제출 후, callback
    //  console.log(_examResult);

    if (connection.userid == _examResult.userid) {
        const len = _examResult.examAnswers.length;
        for (let i = 0; i < len; ++i) {
            const questionNumber = i + 1;
            const examAnswer = _examResult.examAnswers[i];
            const studentAnsweer = _examResult.userAnswers[i];

            markStudent(questionNumber, studentAnsweer, examAnswer)
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
        contents[0] = ['이름', '점수'];   // 타이틀        
        // id, answer, 
        let prefix = contents[0].length;
        for (var i = 0; i < examObj.questionCount; ++i) {
            contents[0][i + prefix] = `${i + 1}번`;
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
    if (mobileHelper.isMobile) {
        widgetContainer.style.right = "max(0px, 290px)";
    }
    else {
        widgetContainer.style.right = "max(17.7%, 290px)";
    }
    classroomManager.canvasResize();
    rightTab.style.zIndex = -1;

    $('#exam-omr').show();
    $('#exam-board').show();
    $('#exam-omr').html('');
    var question = '';

    question += "<div class='exam-header'>";
    question += "<div id='is-testing'>시험 중</div>";
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
        "<button onclick='submitOMR()' id='exam-answer-submit' class='btn btn-exam exam-80-button' onclick='finishExam()'>제출하기</button>";
    $('#exam-omr').html(question);

    examTime *= 60;
    $('#exam-student-timer').html(getFormatmmss(examTime));
    m_ExamTimerInterval = setInterval(function () {
        examTime--;
        examObj.updateExameTimer(examTime);
        $('#exam-student-timer').html(getFormatmmss(examTime));
        if (examTime <= 0)
            finishExam();
    }, 1000);
}

// 학생 시험 OMR 제출
function submitOMR() {
    if (!examObj.checkStudentAnswerChecked(m_QuesCount)) {
        // TODO : 경고 표시, 답안지 작성이 완료가 안되었다는 내용.
        alert($.i18n('QUIZ_SUBMIT_WARNING'));
        return;
    }

    stopQuestionOMR();
    examObj.sendSubmit();
    // $('#exam-omr').html("");
    // $('#exam-board').hide();
}

function stopQuestionOMR() {
    clearInterval(m_ExamTimerInterval);
    var studentOMR = getQuestionAnswerList();
    examObj.examAnswer = studentOMR;
    //  console.log(studentOMR);
    $('#is-testing').html($.i18n('QUIZ_END'));
    $('#exam-omr-question-list').css('pointer-events', 'none');
    $('#exam-answer-submit').hide();
}

// 학생 정답 표시
function markStudent(num, check, answer) {
    console.log(check);
    if (check === answer) {
        $(`#exam-question-${num}`).css('background-color', '#92ecc8');
    } else {
        $(`#exam-question-${num}`).css('background-color', '#fbccc4');
    }
    $(`#exam-student-answer-${num}`).html("(" + answer + ")");
}

// 학생 OMR이 변경됨
function omrChange(num) {
    $(`#exam-question-${num}`).css('background', '#eff1f0');

    // console.log(num + "번이 변경됨");
    var questionNumber = num;
    var answerNumber = $(
        `input:radio[name='exam-question-${num}']:checked`
    ).val();

    // 선생한테 전송.
    examObj.sendSelectExamAnswerToTeacher(questionNumber, answerNumber);
}

function finishExam() {
    clearInterval(m_ExamTimerInterval);
    $('#exam-time').val(parseInt(m_ExamTime / 60));
    $('#exam-setting-bar').show();
    $('#exam-state').html('');
    examObj.sendExamEnd();
}

// 시험 문제 정답률 폼 표시
function showExamStateForm() {
    $('#exam-state').show();
    var stateHtmlStr = '';

    stateHtmlStr += "<div class='exam-header'>";
    stateHtmlStr += '<div>'+$.i18n('QUIZ_ON')+'</div>';
    stateHtmlStr += "<div id='exam-teacher-timer' style='color:red;'>0:0</div>";
    stateHtmlStr += '</div>';
    stateHtmlStr += "<div class='exam-background exam-overflow'>";
    for (var i = 1; i <= m_QuesCount; i++) {
        stateHtmlStr += `<div style='display:flex; height:37px;'>`;
        stateHtmlStr += `<span class='exam-state-progress-number'>${i}.</span>`;
        stateHtmlStr += `<progress style='margin-top:16px; margin-left:13px; width:240px;' id="exam-state-progress-${i}" class='exam-state-progress'  value="0" max="100"></progress>`;
        stateHtmlStr += `<span class='exam-state-percent'  id='exam-state-percent-${i}'>0%</span><br>`;
        stateHtmlStr += `</div>`;
    }
    stateHtmlStr += '</div>';
    stateHtmlStr +=
        "<button id='exam-finish' class='btn btn-danger exam-80-button' onclick='finishExam()'>"+$.i18n('QUIZ_END')+"</button>";

    $('#exam-state').html(stateHtmlStr);
}

function SettingForExam() {
    AddEvent("exam-setting-apply", "click", function () {
        m_QuesCount = $('#exam-question-count').val();
        if (m_QuesCount > 200) {
            alert($.i18n('QUIZ_MAX_ERROR'));
            m_QuesCount = 200;
            $('#exam-question-count').val(m_QuesCount);
        }
        var answerList = getQuestionAnswerList();
        $('#exam-question-list').html('');
        for (var i = 1; i <= m_QuesCount; i++) {
            apeendQuestion(i);
        }

        setQuestionAnswer(answerList);
    })

    AddEvent("exam-start", "click", function () {
        if (m_QuesCount <= 0) {
            alert($.i18n('QUIZ_FILL_ERROR'));
            return;
        }
        //const questionCount = $('#exam-question-count').val();
        if (!examObj.checkAnswerChecked(m_QuesCount)) {
            alert($.i18n('QUIZ_ANSWER_ERROR'));
            return;
        }

        const examTime = $('#exam-time').val();
        if (examTime <= 0 || isNaN(examTime)) {
            alert($.i18n('QUIZ_TIME_ERROR'));
            return;
        }

        m_ExamTime = parseInt($('#exam-time').val() * 60);

        var answerList = getQuestionAnswerList();

        examObj.examAnswer = answerList;
        examObj.sendExamStart(m_QuesCount, parseInt(m_ExamTime / 60));

        $('#exam-setting-bar').hide();
        showExamStateForm();

        $('#exam-teacher-timer').html(getFormatmmss(m_ExamTime));
        m_ExamTimerInterval = setInterval(function () {
            m_ExamTime--;
            examObj.updateExameTimer(m_ExamTime);
            $('#exam-teacher-timer').html(getFormatmmss(m_ExamTime));
            if (m_ExamTime <= 0)
                finishExam();
        }, 1000);
    })
}


function getFormatmmss(sceond) {
    var mm = numberPad(parseInt(sceond / 60), 2);
    var ss = numberPad(sceond % 60, 2);
    return mm + ":" + ss;
}

function numberPad(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}