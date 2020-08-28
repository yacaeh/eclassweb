/*
    학생 알림 관련
*/
class attentionManagerClass{
    constructor(){
        this.studentsAnswer = {};
        this.totalCount = 0;
        this.teacherRequest = {};
    }

    callAttend(){
        let callback = function () {
            let chilldren = document.getElementById('student_list').children;
            for (let i = 0; i < chilldren.length; i++) {
                let al = chilldren[i].getElementsByClassName('bor')[0];
                if (!al)
                    continue;
                al.className = "bor";
                al.classList.add('alert_wait');
            }
        }

        if(connection.extra.roomOwner)
        {
            alertBox("<span>학생들에게 알림을 보내겠습니까?</span>  ", "알림", () => {
                attentionManager.totalCount++;
                attentionManager.teacherRequest[attentionManager.totalCount] = {
                    name : '집중하세요',
                }
                callback();
                connection.send ({
                    alert : true
                });
            },() => {});    
        }
    };

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

    exportAttention(){
        if( attentionManager.totalCount <= 0 ){
            alert("저장할 데이터가 없습니다");
            return false;
        } 
        if(connection.extra.roomOwner) {
            let now = new Date();
            let excelFileName = `${now}_attention.xlsx`;
            let sheetName = connection.sessionid;
    
            let workData = attentionManager.getSubmitData();
    
            // step 1. workbook 생성
            let wb = XLSX.utils.book_new();
    
            // step 3. workbook에 새로만든 워크시트에 이름을 주고 붙인다.  
            XLSX.utils.book_append_sheet(wb, workData, sheetName);
    
            // step 4. 엑셀 파일 만들기 
            let wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
    
            // step 5. 엑셀 파일 내보내기 
            saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), excelFileName);
    
            //console.log("집중모드 저장하였습니다.");
            return true
        }  
    
         // export excel data
   
    
        function s2ab(s) { 
            let buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
            let view = new Uint8Array(buf);  //create uint8array as viewer
            for (let i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
            return buf;    
        }

    };

    getSubmitData () {
        let contents = [];        
        contents[0] = ['이름', '응답'];   // 타이틀        
        // id, answer, 
        let prefix = contents[0].length;
        for(let i = 0; i < this.totalCount; ++i) {
            contents[0][i+prefix] = `${i+1}번`;
        }        
        
        let row = 1;

        let answer = this.studentsAnswer;
        Object.keys(this.studentsAnswer).forEach(function(id){
            const submit = answer[id];
            let content = contents[row];
            content = [submit.name];        
            content[1] = submit.count;
            
            let answerCount = 2;
            for( let i = 1 ; i < submit.userAnswers.length ; i++ )         
            {   
                let result = submit.userAnswers[i];
                let data = '응답없음';
                if( result !== null )                
                    data = result;
                
                content[answerCount++] = data;
            }

            contents[row] = content;
            row +=1;      
        })

        return XLSX.utils.aoa_to_sheet(contents);
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



