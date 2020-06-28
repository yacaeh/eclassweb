
classroomInfo = {    
    allControl : false,
    shareScreen : false,
    share3D : false,    
    students : {},
    alert : {}
    /*
        
        alert : {
            // response
            // time
        }
    */
};

classroomInfo.init = function() {

    // connection.connectCallback = function () {
    // };
};


classroomInfo.alert.sendAlert = function () {    
    if(connection.extra.roomOwner)
    {
        alertBox("학생들에게 알림을 보내겠습니까?", "알림", () => {
           // classroomInfo.alert
            // console.log(connection.getAllParticipants());
            // console.log(connection.getAllParticipants().length);
            connection.send ({
                alert : true
            });
        });    
    }
};

classroomInfo.alert.receivAlert = function () {
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

classroomInfo.alert.receiveAlertResponse = function (_response) {
    if(connection.extra.roomOwner)
    {                  
        const userId = _response.userId;
        const reposne = _response.reposne;
        console.log(_response);
        console.log(connection.getAllParticipants());
        
        // 체크 알림...
        //console.log(event.data.alertConfirm);            
    }

};
