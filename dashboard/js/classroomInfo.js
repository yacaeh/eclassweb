
classroomInfo = {   
    roomOpenTime : 0,       // 방을 처음 개설한 시간
    allControl : false,
    shareScreen : false,
    share3D : {
        state : false,
        data : { }   // position, rotation 
    },
    pdf : {
        state : false,
        data : {
            src : 'https://localhost:9001/ViewerJS/#https://files.primom.co.kr/test.pdf'
        }   // 어떤 pdf, 몇 페이지 등
    },
    exam : false    
};


classroomCommand = {    
    
    /*    
        처음 방에 접속 했을 때, 호출
        방 동기화를 해준다.
    */
    joinRoom : function () {  
        connection.socket.emit ('update-room-info', (_info) => {        
            classroomInfo = _info;
            updateClassTime ();
            this.updateSyncRoom ();
        });
    },

    /*
        session 연결이 되었을 때 호출
        스크린공유는 방장이 공유를 걸어줘야 한다.
    */
    onConnectionSession : function (_data) {
        if(!connection.extra.roomOwner) return;
        
        //  shareScreen은 선생님이 연결을 해주어야 한다.
        if(classroomInfo.shareScreen) {
            classroomCommand.syncScreenShare (_data.userid);
        };
    },    

    /*
        현재 방 상태에 따라 동기화를 해준다.
    */
    updateSyncRoom : function () {    

        if(classroomInfo.allControl) {
            updateControlView(false);
        }
        
        if(classroomInfo.share3D.state) {                  
            sync3DModel ();
        }

        if(classroomInfo.pdf.state) {
            classroomCommand.openPdf ();
        }
    }
};


classroomCommand.sendAlert = function (callback) {    
    if(connection.extra.roomOwner)
    {
        alertBox("학생들에게 알림을 보내겠습니까?", "알림", () => {
           // classroomInfo.alert
            // console.log(connection.getAllParticipants());
            // console.log(connection.getAllParticipants().length);
            callback()
            connection.send ({
                alert : true
            });
        });    
    }
};

classroomCommand.receivAlert = function () {
    var alertTimeHandler;    
    alertBox("<progress max='100' value='100' class='alert-progress exam-state-progress'></progress>", "알림", () => {
        response ('yes');
    }, () => {
        response ('no');
    });        

    alertTimeHandler = setTimeout (noResponse, 5000);

    decreaseProgress = setInterval(function(){
        var progressVal = $(".alert-progress").val() - (10 / 5000 * 100);
        $(".alert-progress").val(progressVal)
    },10);

    function response (yesOrno) {
        connection.send({                
            alertResponse :  {
                userid : connection.userid,
                response : yesOrno
            }
        }); 
        clearInterval(decreaseProgress);
        clearTimeout(alertTimeHandler);   
    }
    
    function noResponse () {
        clearInterval(decreaseProgress);
        clearTimeout(alertTimeHandler);         
        $('#alert-box').fadeOut(300);       
    };
};

// 학생이 응답했을 때, 선생님 처리 부분
classroomCommand.receiveAlertResponse = function (_response) {
    if(connection.extra.roomOwner)
    {                  
        const userId = _response.userid;
        const response = _response.response; 

        var chilldren = document.getElementById("student_list").children;
            
        for(var i = 0; i < chilldren.length; i++){
            if(chilldren[i].dataset.id == userId){
                var al = chilldren[i].getElementsByClassName("alert")[0];
                al.className = "";
                al.classList.add("alert");

                if(response == "yes")
                    al.classList.add("alert_yes");
                else 
                    al.classList.add("alert_no");
            }
        }
        // 체크 알림...
        //console.log(event.data.alertConfirm);            
    }
}

/*
    공유 스크린 설정
*/
classroomCommand.setShareScreenServer = function (_state, success, error) {    
    
    classroomCommand.setShareScreenLocal (_state);

    connection.socket.emit('set-share-screen', _state, result => {  
        if(result.result)
            success ();
        else 
            error (result.error);
    });
};

classroomCommand.setShareScreenLocal = function (_state) {
    classroomInfo.shareScreen = _state;
};
/*
    Screen share
 */

classroomCommand.syncScreenShare = function (_userid) {
    currentScreenViewShare (_userid);
};

/*
    PDF
*/

classroomCommand.sendOpenPdf = function () {
    classroomInfo.pdf.state = true;
    connection.send({
        pdf : classroomInfo.pdf
    });
};

classroomCommand.sendClosePdf = function () {
    classroomInfo.pdf.state = false;
    connection.send({
        pdf : {
            state : false
        }
    });
};

classroomCommand.sendPDFCmd = function (_cmd) {
    if(!connection.extra.roomOwner) return;    
    if(!classroomInfo.allControl) return;

    connection.send ({
        pdf : {
            cmd : _cmd
        }
    });
}

classroomCommand.updatePDFCmd = function (_cmd) {

    let frame = document
    .getElementById('widget-container')
    .getElementsByTagName('iframe')[0].contentWindow;
    let fileViewer = frame.document.getElementById('file-viewer');
    if(!fileViewer)  return;

    switch(_cmd)
    {
        case "first-page" :            
            fileJQuery = $("#widget-container").find("#iframe").contents().find("#file-viewer");
            fileJQuery.scrollTop();
            break;
        case 'next' :
            fileViewer.contentWindow.document.getElementById('next').click();
            break;
        case 'prev' :
            fileViewer.contentWindow.document.getElementById('previous').click();
            break;
        case 'last-page' :
            fileViewer.contentWindow.document.getElementById('previous').click();
            break;
        case 'fullscreen' :
            fileViewer.contentWindow.document.getElementById('fullscreen').click();
            break;
        case 'presentation' :
            fileViewer.contentWindow.document.getElementById('presentation').click();
            break;
        case 'zoomIn' :
            fileViewer.contentWindow.document.getElementById('zoomIn').click();
            break;
        case 'zoomOut' :
            fileViewer.contentWindow.document.getElementById('zoomOut').click();
            break;
    }
}


classroomCommand.receivePdfMessage = function (_pdf) {  
    if(_pdf.cmd) {
        classroomCommand.updatePDFCmd (_pdf.cmd);
    }else   {
        let currentState = classroomInfo.pdf.state;
        if(currentState != _pdf.state) {       
            classroomInfo.pdf = _pdf;
            classroomCommand.syncPdf ();
        }
    }
};

classroomCommand.openPdf = function () {
    loadFileViewer ();
    $('#canvas-controller').show();
};

classroomCommand.closePdf = function () {
    unloadFileViewer();
    $('#canvas-controller').hide();
}

classroomCommand.syncPdf = function () {    
    if(classroomInfo.pdf.state) {
        // open
        classroomCommand.openPdf ();
    }
    else {
        // close        
        classroomCommand.closePdf ();     
    }
};


/*
    방 오픈 경과 시간 동기화
*/
classroomCommand.syncClassroomOpenTime =  function () {    
    updateClassTime ();
};
