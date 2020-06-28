
classroomInfo = {    
    allControl : false,
    shareScreen : false,
    share3D : false,
    students : {},
    alert : {}
    /*
        students {
            userId,
            alert,
        }
    */
};


classroomInfo.alert.sendAlert = function () {
    if(connection.extra.roomOwner)
    {
        alertBox("학생들에게 알림을 보내겠습니까?", "알림", () => {
            connection.send ({
                alert : true
            });
        });    
    }
};

classroomInfo.alert.receivAlert = function () {
    var alertTimeHandler;    
    alertBox("알림이 도착하였습니다", "알림", () => {
        response (true);
    }, () => {
        response (false);
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

classroomInfo.alert.receiveAlertResponse = function (_response) {
    if(connection.extra.roomOwner)
    {                  
        console.log(_response);
        console.log(connection.getAllParticipants());
        
        // 체크 알림...
        //console.log(event.data.alertConfirm);            
    }

};
