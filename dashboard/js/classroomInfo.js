
classroomInfo = {    
    allControl : false,
    shareScreen : false,
    share3D : false 
    /*
        
        alert : {
            // response
            // time
        }
    */
};


classroomCommand = {
};



classroomCommand.updateSyncRoom = function () {

    if(classroomInfo.allControl) {

    }

    if(classroomInfo.shareScreen) {

    }

    if(classroomInfo.share3D) {

    }
};

classroomCommand.sendsyncRoomInfo = function (_data) {
    connection.send ({
        roomSync : {
            userid : _data.userid,
            info : classroomInfo
        }
    });
};

classroomCommand.receiveSyncRoomInfo = function (_syncRoom) {   
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
                userId : connection.userid,
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
classroomCommand.receiveAlertResponse = function (_response, callback) {
    if(connection.extra.roomOwner)
    {                  
        const userId = _response.userId;
        const reposne = _response.reposne; 

        var chilldren = document.getElementById("student_list").children;
            
        for(var i = 0; i < chilldren.length; i++){
            if(chilldren[i].dataset.id == userId){
                var al = chilldren[i].getElementsByClassName("alert")[0];
                al.className = "";
                al.classList.add("alert");

                if(reposne == "yes")
                    al.classList.add("alert_yes");
                else 
                    al.classList.add("alert_no");
            }
        }

        // 체크 알림...
        //console.log(event.data.alertConfirm);            
    }
};

