var attentionObj = {
    isStart : false,    
    totalCount : 0,

    teacherRequest : {},
    studentsAnswer : {}    
};


attentionObj.callAttend = (message) => {    
    console.log( "Attention Call Attend : " + JSON.stringify(message));

    attentionObj.totalCount++;
    attentionObj.teacherRequest[attentionObj.totalCount] = {
        name : message.msg,
    }
}

attentionObj.submit = (submitStudent) => {
    console.log( "Attention submit : " + JSON.stringify(submitStudent) );
    
    let userid = submitStudent.userid;
    let name = submitStudent.name;

    let studentAnswerInfo = attentionObj.studentsAnswer[userid];
    if(!studentAnswerInfo)
    {
        // studentAnswer가 없다면 새로 만들어 준다.
        attentionObj.studentsAnswer[userid] = {
            userid : userid,   // 학생 아디
            name : name,
            count : 0,
            userAnswers : []    // 학생이 선택한 항목을 저장 
        };

        studentAnswerInfo = attentionObj.studentsAnswer[userid];
    }
    
    studentAnswerInfo.userAnswers[attentionObj.totalCount] = submitStudent.response;
    studentAnswerInfo.count++;

    console.log( "Attention submit : " + JSON.stringify(attentionObj.studentsAnswer) );
};

attentionObj.exportAttention = () => {
    if( attentionObj.totalCount <= 0 ){
        console.log("집중모드 저장할 데이타가 없습니다.");
        return false;
    } 

    if(connection.extra.roomOwner) {
        let now = new Date();
        const excelFileName = `${now}_attention.xlsx`;
        const sheetName = connection.sessionid;

        const workData = getSubmitData();

        // step 1. workbook 생성
        let wb = XLSX.utils.book_new();

        // step 3. workbook에 새로만든 워크시트에 이름을 주고 붙인다.  
        XLSX.utils.book_append_sheet(wb, workData, sheetName);

        // step 4. 엑셀 파일 만들기 
        let wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});

        // step 5. 엑셀 파일 내보내기 
        saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), excelFileName);

        console.log("집중모드 저장하였습니다.");
        return true
    }  

     // export excel data
    function getSubmitData () {
        var contents = [];        
        contents[0] = ['이름', '응답'];   // 타이틀        
        // id, answer, 
        let prefix = contents[0].length;
        for(var i = 0; i < attentionObj.totalCount; ++i) {
            contents[0][i+prefix] = `${i+1}번`;
        }        
        
        var row = 1;
        for(id in attentionObj.studentsAnswer)
        {
            const submit = attentionObj.studentsAnswer[id];
            var content = contents[row];
            content = [submit.name];        
            content[1] = submit.count;
            
            var answerCount = 2;            
            console.log( '응답횟수 : ' + submit.userAnswers.length)

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

// 종료시 저장하시겠습니까 메시지 발생 시킨다.
// window.addEventListener("beforeunload", function (e) {
//     var confirmationMessage = "저장하지 않은 데이터가 있습니다.";

//     (e || window.event).returnValue = confirmationMessage; //Gecko + IE

//     return confirmationMessage;                            //Webkit, Safari, Chrome
// });