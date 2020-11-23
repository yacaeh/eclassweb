class SaveNotification extends React.Component {
    state = {
        // studentsAnswer : {},
        teacherRequest : {},
        // totalCount : 0
    }

    constructor(props){
        super(props);
        this.exportAttention = this.exportAttention.bind(this);
    }

    render(){
        return <img onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave} className="top_icon" id="top_save_alert" onClick={this.exportAttention} data-des={GetLang('TOP_SAVE_ALERT')} />
    }

    exportAttention() {
        if( attentionManager.totalCount <= 0 ){
            alert(window.langlist.NO_DATA_STORE);
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
        contents[0] = [window.langlist.NAME, window.langlist.ANSWER];   // 타이틀        
        // id, answer, 
        let prefix = contents[0].length;
        for(let i = 0; i < attentionManager.totalCount; ++i) {
            contents[0][i+prefix] = `${i+1}`;
        }        
        
        let row = 1;

        let answer = attentionManager.studentsAnswer;
        Object.keys(attentionManager.studentsAnswer).forEach(function(id){
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
        if (document.getElementById("exam-board").style.display == "block") {
            return;
        }

        reactEvent.AlertBox({
            title : window.langlist.NOTIFICATION,
            content : window.langlist.NOTIFICATION_WARNING,
            yes : callback
        })

        function callback() {
            attentionManager.totalCount++;
            attentionManager.teacherRequest[attentionManager.totalCount] = {name: window.langlist.ATTENTION_PLEASE};
            connection.send({alert: true});

            let chilldren = document.getElementById('student_list').children;
            for (let i = 0; i < chilldren.length; i++) {
                let al = chilldren[i].getElementsByClassName('bor')[0];
                if (!al)
                    continue;
                al.className = "bor";
                al.classList.add('alert_wait');
            }
        }

    };

    render() {
        return <img onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave} className="top_icon" id="top_alert" onClick={this.callAttend} data-des={GetLang('TOP_NOTIFY')}/>
    }
}