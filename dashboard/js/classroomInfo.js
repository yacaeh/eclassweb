
classroomInfo = {    
    allControl : false,
    shareScreen : false,
    share3D : {
        state : false,
        data : {
            src : 'https://localhost:9001/ViewerJS/#https://files.primom.co.kr/test.pdf'
        }   // position, rotation 
    },
    pdf : {
        state : false,
        data : {}   // 어떤 pdf, 몇 페이지 등
    },
    exam : false    
};


classroomCommand = {
};



classroomCommand.updateSyncRoom = function () {

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
    alertBox("알림이 도착하였습니다", "알림", () => {
        response ('yes');
    }, () => {
        response ('no');
    });        

    alertTimeHandler = setTimeout (noResponse, 5000);

    function response (yesOrno) {
        connection.send({                
            alertResponse :  {
                userid : connection.userid,
                response : yesOrno
            }
        }); 
        clearTimeout(alertTimeHandler);   
    }
    
    function noResponse () {
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

classroomCommand.receivePdfMessage = function (_pdf) {  
    classroomInfo.pdf = _pdf;
    classroomCommand.syncPdf ();
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

