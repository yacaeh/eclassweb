
var examObj = {
    isStart : false,        // 현재 시험 중인지 아닌지 판단
    totalCount : 0,         // 시험 치는 인원
    questionCount : 0,      // 시험 문제수
    currentExamTime : 0,   // 현재 시험 남은 시간
    examTime : 0,          // 시험 시간(minute)    
    examAnswer : [],      // question 정답, 선생은 정답 저장, 학생은 자신이 선택한 정답 저장
    studentsAnswer : {},  // 학생들 정답 저장.
    submitStudents : {}    // 학생이 제출 했을 때, 최종 값
    /*
        학생별 저장값    
        studentsAnswer : {                        
            id, 유저 아디,
            name : 유저 이름
            userAnswers, : 유저가 고른 정답
            answers : 실패 답과 비교 후, 정답인지 아닌지 값 저장
        }
      */
};

// 정답 확인.
examObj.checkAnswerCount = function (studentAnswers) {
    var len = examObj.examAnswer.length;
    if(studentAnswers.length != len)
    {
        console.error('문제와 답의 개수가 맞지 않습니다.');
        return '문제와 답의 개수가 맞지 않습니다.';
    }

    var equalCount = 0;
    for(var i = 0; i < len; ++i)
    {
        if(examObj.examAnswer[len] == studentAnswers[i])
            equalCount += 1;        
    }
    return equalCount;
};

examObj.checkAnswer = function (_questionNumber, _answerNumber) {
    try {
        return examObj.examAnswer[_questionNumber] === _answerNumber;
    }catch(error) {
        console.error(`answer error ${error}`);
        return null;    
    }
}


examObj.updateStudentAnswer = function (selectAnswer) {   
    // 학생의 시험 답 하나를 갱싱한다.
    var studentAnswerInfo = examObj.studentsAnswer[selectAnswer.id];
    if(!studentAnswerInfo)
    {
        // studentAnswer가 없다면 새로 만들어 준다.
        examObj.studentsAnswer[selectAnswer.id] = {
            id : selectAnswer.id,   // 학생 아디
            name : selectAnswer.name,
            userAnswers : [],       // 학생이 선택한 번호
            answers : [],           // bool형. 현재 값이 정답인지 아닌지 미리 계산해서 저장.
            response : [],          // 학생의 문제 응답률.
        };

        studentAnswerInfo = examObj.studentsAnswer[selectAnswer.id];
    }
    var userAnswers = studentAnswerInfo.userAnswers;
    userAnswers[selectAnswer.questionNumber] = selectAnswer.answerNumber;
    studentAnswerInfo.answers[selectAnswer.questionNumber] = examObj.checkAnswer(selectAnswer.questionNumber, selectAnswer.answerNumber);        
    if(!studentAnswerInfo.response[selectAnswer.questionNumber])
    {
        if(null != selectAnswer.answerNumber)
            studentAnswerInfo.response[selectAnswer.questionNumber] = true;
    }
};


examObj.updateStudentAnswers = function (examAnswers) {
    //  학생의 시험 답 전체를 갱신한다.
    var len = examAnswers.answers.length;
    for(var questionNumber = 0; questionNumber < len; ++questionNumber) {
        examObj.updateStudentAnswer ({
            id : examAnswers.id,
            name : examAnswers.name,
            questionNumber : questionNumber,
            answerNumber : examAnswers.answers[questionNumber]
        }); 
    }
};

examObj.updateSubmitStudent = function (submitStudent) {
    var id = submitStudent.id;
    let date = new Date();
    student = examObj.studentsAnswer[id];
    if(!student.userAnswers)
        student.userAnswers = {};
    examObj.submitStudents[id] =  {
        id : id,
        name : student.name,
        userAnswers : student.userAnswers,
        answers : student.answers,
        time : date
    };
    //if(examObj.submitCount
}



examObj.updateExamResponseStatisticsEach = function (_questionNumber) {    
    //const studentCounts = connection.getAllParticipants().length;
    const studentCounts = examObj.totalCount;
    var responseCount = 0;
    for(id in examObj.studentsAnswer)
    {   
        var student = examObj.studentsAnswer[id];
        if(student.response[_questionNumber] == true)
            responseCount += 1;                
    }
    setExamState ((_questionNumber + 1), (responseCount / studentCounts) * 100);
};


examObj.updateExamResponseStatistics = function () {

    // 통계값 갱신..
    const questionLen = examObj.questionCount;
    for(var currentQuestion = 0; currentQuestion < questionLen; ++currentQuestion) {   
        examObj.updateExamResponseStatisticsEach (currentQuestion);               
    }
};




examObj.updateExamAnswerStatisticsEach = function (_questionNumber) {    
    const studentCounts = examObj.totalCount;
    var answerCount = 0;
    for(id in examObj.studentsAnswer)
    {   
        var student = examObj.studentsAnswer[id];
        if(student.answers[_questionNumber] == true)
            answerCount += 1;                
    }
    setExamState ((_questionNumber + 1), (answerCount / studentCounts) * 100);
};


examObj.updateExamAnswerStatistics = function () {

    // 통계값 갱신..
    const questionLen = examObj.questionCount;
    for(var currentQuestion = 0; currentQuestion < questionLen; ++currentQuestion) {   
        examObj.updateExamAnswerStatisticsEach (currentQuestion);               
    }
};



examObj.receiveExamData = function(_data) {
   
    if(_data.examStart) {       
        let examStart = _data.examStart;
        examObj.isStart = true;
        examObj.examTime = examStart.examTime;
        examObj.currentExamTime = examStart.examTime;
        examObj.questionCount = examStart.questionCount;
        examObj.examAnswer = {};

        setStudentOMR (examObj.questionCount, examObj.examTime);
    }
    else if(_data.examEnd) {    
        // 시험 종료
        if(examObj.isStart)    
        {
            examObj.isStart = false;     
            // 학생들 시험 제출.   
            submitOMR ();
        }
    } 
    else if (_data.examSelectAnswer) {
        examObj.receiveSelectExamAnswerFromStudent (_data.examSelectAnswer);
    }
    else if(_data.submit) {
        examObj.receiveSubmit (_data.submit);
    }
};

//  시험지 모든 문제에 체크를 했는지 확인. 
examObj.checkAnswerChecked = function () {
    for(let i = 1; i <= examObj.questionCount; ++i) {
        let checked = 1 == $(`input:radio[name='exam-question-${i}']:checked`).length;                
        if(!checked)
            return false;
    }
    return true;
};

examObj.sendExamStart  = function(_examTime) {
    if(connection.extra.roomOwner)
    {    
        examObj.isStart = true;
        examObj.totalCount = connection.getAllParticipants().length;
        examObj.examTime = _examTime;
        examObj.submitCount = 0;
        examObj.studentsAnswer = {};
        examObj.submitStudents = {};
        connection.send({
            exam: {
                examStart : {
                    examTime : examObj.examTime,
                    questionCount : examObj.questionCount
                }
            }
        });    
    }
}

examObj.sendExamEnd = function() {
    if(connection.extra.roomOwner)
    {
        examObj.isStart = false;
        connection.send({
            exam: {
                examEnd : true
            }
        });
    }
}

examObj.sendSubmit = function() {
    //  학생이 선생한테 정답 제출
    connection.send({
        exam : {
            submit : {
                id : connection.userid,
                name : params.userFullName,
                answers : examObj.examAnswer
            }
        }
    });
};


examObj.sendSelectExamAnswerToTeacher = function (_questionNumber, _answerNumber) {
    //
    connection.send({
        exam : {
            examSelectAnswer : {
                id : connection.userid,
                name : params.userFullName,
                questionNumber : (_questionNumber-1), // 번호가 1번부터 할당되기 때문에 -1을 하였다.
                answerNumber : _answerNumber
            }
        }
    });
};


examObj.receiveSelectExamAnswerFromStudent = function(selectAnswer) {    
    // 학생으로부터 정답 받았을 때, 처리
    if(connection.extra.roomOwner)
    {
        examObj.updateStudentAnswer ({
            id : selectAnswer.id,
            name : selectAnswer.name,
            questionNumber : selectAnswer.questionNumber,
            answerNumber :selectAnswer.answerNumber
        });

        examObj.updateExamAnswerStatisticsEach (selectAnswer.questionNumber); // 정답률
        // examObj.updateExamResponseStatisticsEach (selectAnswer.questionNumber); // 응답률
    }
};


examObj.receiveSubmit = function (submit) {
    // 학생 정답 확인.
    if(connection.extra.roomOwner)   {
        examObj.updateStudentAnswers (submit);  // 최신 기록 저장,     
        examObj.updateSubmitStudent (submit); 
        examObj.updateExamAnswerStatistics ();        
        const len = examObj.totalCount;
        examObj.submitCount += 1;
        if(examObj.totalCount == examObj.submitCount)   // 마지막 제출이 끝났을 때, 결과를 export 한다.
          { 
               examObj.exportExam ();
               $('#exam-start').attr('class', 'btn btn-primary');
               $('#exam-start').html('시작');
               clearInterval(m_ExamTimerInterval);    
               $('#exam-time').val(parseInt(m_ExamTime / 60))
          }
    }
};

examObj.receiveSubmitConfirmToTeacher = function () {
    // 시험 정답 제출 후, callback
};

examObj.exportExam = function () {
    if(connection.extra.roomOwner) {
        let now = new Date();
        const excelFileName = `${now}.xlsx`;
        const sheetName = connection.sessionid;

        const workData = getSubmitData();

        // step 1. workbook 생성
        var wb = XLSX.utils.book_new();

        // step 3. workbook에 새로만든 워크시트에 이름을 주고 붙인다.  
        XLSX.utils.book_append_sheet(wb, workData, sheetName);

        // step 4. 엑셀 파일 만들기 
        var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});

        // step 5. 엑셀 파일 내보내기 
        saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), excelFileName);
    }    

    function getSubmitData () {
        var contents = [];        
        contents[0] = ['이름'];   // 타이틀        
        // id, answer, 
        let prefix = contents[0].length;
        for(var i = 0; i < examObj.questionCount; ++i) {
            contents[0][i+prefix] = `${i+1}번`;
        }        

        var index = 1;
        for(id in examObj.submitStudents)
        {
            const submit = examObj.submitStudents[id];
            var content = contents[index];
            content = [submit.name];        

            var answerCount = 1;
            // 정답 저장
            for(answerIndex in submit.answers)            
                content[answerCount++] = submit.answers[answerIndex];


            contents[index] = content;
            index +=1;      
        }
        return XLSX.utils.aoa_to_sheet(contents);
    };

    

    function s2ab(s) { 
        var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
        var view = new Uint8Array(buf);  //create uint8array as viewer
        for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
        return buf;    
    }
};