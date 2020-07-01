
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
};

/*    

*/
classroomCommand.openRoom = function () {
    var date = new Date();        
    classroomInfo.roomOpenTime = date.getTime();
    updateClassTime ();
};


classroomCommand.updateSyncRoom = function () {    

    classroomCommand.syncClassroomOpenTime ();

    if(classroomInfo.allControl) {
        allControllEnable(top_all_controll_jthis, classroomInfo.allControl, false);
    }
    // else

    // if(classroomInfo.shareScreen) {
        
    // }
    if(classroomInfo.share3D.state) {                  
        sync3DModel ();
    }

    if(classroomInfo.pdf.state) {
        classroomCommand.openPdf ();
    }
};

classroomCommand.sendsyncRoomInfo = function (_data) {
    /*
        방에 학생이 들어오면, 현재 방 상태 정보를 동기화 시키기 위해
        방상태 정보를 보낸다.
    */
    connection.send ({
        roomSync : {
            userid : _data.userid,
            info : classroomInfo
        }
    });

    // shareScreen은 선생님이 해당 학생한테 공유 해줘야 한다. 
    if(classroomInfo.shareScreen) {
        classroomCommand.syncScreenShare (_data.userid);
    };
};

classroomCommand.receiveSyncRoomInfo = function (_syncRoom) {  
    console.log(_syncRoom);
    if(_syncRoom.userid == connection.userid) {              
        classroomInfo = _syncRoom.info;
        classroomCommand.updateSyncRoom ();
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
