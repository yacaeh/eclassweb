/*
    학생 알림 관련
*/
class attentionManagerClass{
    constructor(){
        this.studentsAnswer = {};
        this.totalCount = 0;
        this.teacherRequest = {};
    }

    submit(submitStudent){
        let userid = submitStudent.userid;
        let name = submitStudent.name;
        let studentAnswerInfo = this.studentsAnswer[userid];
        
        if(!studentAnswerInfo)
        {
            // studentAnswer가 없다면 새로 만들어 준다.
            this.studentsAnswer[userid] = {
                userid : userid,   // 학생 아디
                name : name,
                count : 0,
                userAnswers : []    // 학생이 선택한 항목을 저장 
            };
    
            studentAnswerInfo = this.studentsAnswer[userid];
        }
        
        studentAnswerInfo.userAnswers[this.totalCount] = submitStudent.response;
        studentAnswerInfo.count++;
    };

    resetBorder(){
        let chilldren = document.getElementById('student_list').children;
        for (let i = 0; i < chilldren.length; i++) {
            let al = chilldren[i].getElementsByClassName('bor')[0];
            if (!al)
                continue;
            al.className = "bor";
            al.classList.remove('alert_wait');
            al.classList.remove('alert_yes');
            al.classList.remove('alert_no');
        }
    }
}



