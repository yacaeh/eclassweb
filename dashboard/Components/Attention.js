class SaveNotification extends React.Component {
    state = {
        studentsAnswer : {},
        teacherRequest : {},
        totalCount : 0
    }

    constructor(props){
        super(props);
        this.exportAttention = this.exportAttention.bind(this);
    }

    render(){
        return <img className="top_icon" id="top_save_alert" onClick={this.exportAttention} />
    }

    exportAttention() {
        if( this.state.totalCount <= 0 ){
            alert($.i18n( 'NO_DATA_STORE' ));
            return false;
        } 

        if(connection.extra.roomOwner) {
            let now = new Date();
            let excelFileName = `${now}_attention.xlsx`;
            let sheetName = connection.sessionid;
            let workData = this.getSubmitData();
            let wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, workData, sheetName);
            let wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
            saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), excelFileName);
            return true
        }  
    
        function s2ab(s) { 
            let buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
            let view = new Uint8Array(buf);  //create uint8array as viewer
            for (let i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
            return buf;    
        }
    }

    getSubmitData () {
        let contents = [];        
        contents[0] = [$.i18n('NAME'), $.i18n('ANSWER')];   // 타이틀        
        // id, answer, 
        let prefix = contents[0].length;
        for(let i = 0; i < this.state.totalCount; ++i) {
            contents[0][i+prefix] = `${i+1}`;
        }        
        
        let row = 1;

        let answer = this.state.studentsAnswer;
        Object.keys(this.state.studentsAnswer).forEach(function(id){
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


}

class Attention extends React.Component {
    callAttend() {
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

        if (document.getElementById("exam-board").style.display == "block") {
            return;
        }


        alertBox("<span>" + $.i18n('NOTIFICATION_WARNING') + "</span>  ", $.i18n('NOTIFICATION'), () => {
            attentionManager.totalCount++;
            attentionManager.teacherRequest[attentionManager.totalCount] = {name: $.i18n('ATTENTION_PLEASE')};
            callback();
            connection.send({alert: true});
        }, () => { });
    };

    render() {
        return <img className="top_icon" id="top_alert" onClick={this.callAttend} />
    }
}