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
            this.studentsAnswer[userid] = {
                userid      : userid,   // 학생 아디
                name        : name,
                count       : 0,
                userAnswers : []    // 학생이 선택한 항목을 저장 
            };
    
            studentAnswerInfo = this.studentsAnswer[userid];
        }
        
        studentAnswerInfo.userAnswers[this.totalCount] = submitStudent.response;
        studentAnswerInfo.count++;
    };
}



