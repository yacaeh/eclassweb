
classroomInfo = {   
    roomOpenTime : 0,       // 방을 처음 개설한 시간
    allControl : true,
    shareScreen : {
        state : false,
        id : undefined
    },
    share3D : {
        state : false,
        data : { }   // position, rotation 
    },
    epub : {
        state : false,
        page : 0,        
        data : {
            src : 'https://files.primom.co.kr/epub/fca2229a-860a-6148-96fb-35eef8b43306/Lesson07.epub/ops/content.opf'
        }   // 어떤 pdf, 몇 페이지 등
    },
    viewer : {
        state : false,  // on, off
        type : 'none',  // pdf, video, jpg,
        loaded : false,
    },
    exam : false,
    classPermission : undefined,
    micPermission : undefined,
};

classroomInfoLocal = {
    allControl : true,
    shareScreen : {
        state : false,
        id : undefined
    },
    share3D : false,
    pdf : false,
    epub : false,
    exam : false  
};




classroomCommand = {    
    
    /*    
        처음 방에 접속 했을 때, 호출
        방 동기화를 해준다.
    */
    joinRoom : function () {  
        connection.socket.emit ('update-room-info', (_info) => {
            console.log(_info);                    
            classroomInfo.roomOpenTime = _info.roomOpenTime;
            classroomInfo.allControl = _info.allControl;
            classroomInfo.shareScreen.state = _info.shareScreen;
            classroomInfo.share3D.state = _info.share3D.state;                 
            classroomInfo.exam = _info.exam;
            classroomInfo.classPermission = _info.classPermission;
            classroomInfo.micPermission = _info.micPermission;

            updateClassTime ();
            if(connection.extra.roomOwner)
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
        if(classroomInfo.shareScreen.state) {
            classroomCommand.syncScreenShare (_data.userid);
        };
        
        // 로컬에서만 사용하는 데이터를 동기화 시켜 준다.
        // 학생들은 선생님한테 룸 정보를 받아서, 선생님 정보를 동기화 시켜준다.
        // 선생님이 로컬에서만 저장하는 데이터만 있을 수 있기 때문..

        let sendObj = {
            userid : _data.userid,
            roomInfo : classroomInfo            
        };
        connection.send(sendObj);
    },    

    //  학생들은 여기에서 선생님 화면과 동기화 시켜준다.
    onReceiveRoomInfo : function (_info) {        
        if(_info.userid == connection.userid) {
            classroomInfo = _info.roomInfo;    
            this.copyGlobalToLocal ();        
            this.updateSyncRoom ();
        }
        LoadScreenShare();
    },
    
    
    //  Global Data를 Local에 Copy.
    copyGlobalToLocal : function() {
        classroomInfoLocal.allControl = classroomInfo.allControl;
        classroomInfoLocal.shareScreen = classroomInfo.shareScreen;
        classroomInfoLocal.share3D = classroomInfo.share3D;   
        classroomInfoLocal.epub = classroomInfo.epub;
        classroomInfoLocal.exam = classroomInfo.exam;
        classroomInfoLocal.viewer = classroomInfo.viewer;
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

        if(classroomInfo.epub.state) {
            classroomCommand.openEpub ();
        }

        if(classroomInfo.viewer.state) {
            classroomCommand.syncViewer ();
        }

        // if(classroomInfo.shareScreen.state){
        //     classroomCommand.openShare();
        // }
    },


    /*
        동기화 메시지..
    */
    sendSynchronizationBroadcast : function () {
        // connection.send ();
    },

    onSynchronizationClassRoom : function (_roomInfo) {
        classroomInfo = _roomInfo;        
        this.updateSyncRoom ();
    }
};



classroomCommand.openShare = function (callback){
    var s = GetStream(classroomInfoLocal.shareScreen.id)
    if(s != undefined){
        GetScreenViewer().srcObject = s;
        GetScreenViewer().style.display = 'block';
    }
    
    console.log("OPEN SHARE",s)
}

classroomCommand.exitAlert = function (callback) {    
    
    alert_exit_Box("나가시겠습니까?", "경고", () => {
        callback()
    });
    
};

classroomCommand.sendAlert = function (callback) {    
    if(connection.extra.roomOwner)
    {
        alertBox("<span>학생들에게 알림을 보내겠습니까? \<label class='label_stu' for='view_stu'><input checked id='view_stu' type='checkbox'>학생 보기</label> \
        </span>  ", "알림", () => { //callback yes
           // classroomInfo.alert
            // console.log(connection.getAllParticipants());
            // console.log(connection.getAllParticipants().length);
            callback();
            if(document.getElementById("view_stu").checked){
                document.getElementById("top_student").click();
            }

            attentionObj.callAttend({msg:"집중하세요"});  //집중하세요관한 저장처리
            connection.send ({
                alert : true
            });
        },()=>{ //callback no 파일 저장한다.
            // attentionObj.exportAttention();
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

// 학생이 선생님에게 내가 다른곳을 보고 있다고 보고한다.
classroomCommand.receivedOnFocusResponse = (_response) => {
    if(connection.extra.roomOwner)
    {     
        let userId = _response.userId;
        let boolOnFocus = _response.onFocus; 

        let children = document.getElementById("student_list").children;

        for(let i = 0; i < children.length; i++){
            if( children[i].dataset.id == userId ){
                var student_overlay = $(`[data-id='${userId}'] > .student-overlay`);
                if(boolOnFocus == false){
                    student_overlay.css('background','black');
                }
                else{
                    student_overlay.css('background','none');
                }
                console.log( "ReceivedOnFocus Respose : " +  userId + ", " + boolOnFocus );    
            }
        };
    }
};

// 학생이 선생님에게 권한 요청을 한다.
classroomCommand.receivedCallTeacherResponse = (userId) => {
    if(connection.extra.roomOwner)
    {        
        let children = document.getElementById("student_list").children;

        for(let i = 0; i < children.length; i++){
            if( children[i].dataset.id == userId ){
                console.log( "Received Call Teacher Respose : " +  userId );    

                var student_overlay;
                var isMeCount = 5;
                var flickerInterval = setInterval(function(){
                    student_overlay = $(`[data-id='${userId}'] > .student-overlay`);
                    var initBackColor = student_overlay.css('background');
                    var orangeColor = setOverlayColor('orange');
                    setTimeout(function(){
                        student_overlay = $(`[data-id='${userId}'] > .student-overlay`);
                        var initBackColor2 = student_overlay.css('background');
                        if(orangeColor !== initBackColor2)
                            initBackColor = initBackColor2
                        setOverlayColor(initBackColor);
                    } ,500);
                    if(isMeCount-- <= 0)
                        clearInterval(flickerInterval);
                },1000);
                
                function setOverlayColor(overlayColor){
                    student_overlay.css('background',overlayColor);
                    return student_overlay.css('background');
                }
            }
        };
    }
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



classroomCommand.StopScreenShare = function(){
    classroomInfo.shareScreen = {};
    classroomInfo.shareScreen.state = false
    classroomInfo.shareScreen.id = undefined
    classroomInfo.shareScreen.stream = undefined

    classroomInfoLocal.shareScreen.state = false;
    classroomInfoLocal.shareScreen.id = false;
}


/*
    공유 스크린 설정
*/
classroomCommand.setShareScreenServer = function (_data, success, error) {    
    connection.socket.emit('set-share-screen', _data, result => {  
        if(result.result)
            success ();
        else {
            console.log(result.error);
            alert(result.error)
            error (result.error);
        }
    });
};

classroomCommand.setShareScreenLocal = function (_data) {
    classroomInfo.shareScreen.state = _data.state;
    classroomInfo.shareScreen.id = _data.id;
    classroomInfoLocal.shareScreen.state = _data.state;
    classroomInfoLocal.shareScreen.id = _data.id;
};
/*
    Screen share
 */

classroomCommand.syncScreenShare = function (_userid) {
    // connection.peers.forEach(function(e){
        // console.log(e);
    // })
    // currentScreenViewShare (_userid);
};


/*
    PDF
*/
/*
    학생들한테 오는 메시지 처리.
*/
classroomCommand.onStudentCommand = function (_cmd) {    
    switch(_cmd.cmd) {
        case 'pdf-page' :
            classroomStudentsWatchInfo.setPdfPage (_cmd.from, _cmd.data);
            break;
    }
}

classroomCommand.openFile = function (_url) {   
    mfileViewer.openFile (_url);
}


classroomCommand.updateViewer = function (_cmd) {
    mfileViewer.updateViewer(_cmd);
}

classroomCommand.closeFile = function () {  
    mfileViewer.closeFile ();
}

classroomCommand.onShowPage = function (_page) {        
    mfileViewer.onShowPage (_page);
}

classroomCommand.onViewerLoaded = function () {
    mfileViewer.onLoadedViewer ();
}

classroomCommand.syncViewer = function () {
    mfileViewer.syncViewer ();
}

/*
    Epub
*/
classroomCommand.receiveEpubMessage = function (_epub) {  
    if(_epub.cmd) {
        classroomCommand.updateEpubCmd (_epub);
    }else   {
        let currentState = classroomInfo.epub.state;
        if(currentState != _epub.state) {       
            classroomInfo.epub = _epub;
            classroomCommand.syncEpub ();
        }
    }
};

classroomCommand.sendOpenEpub = function () {
    classroomInfo.epub.state = true;
    connection.send({
        epub : classroomInfo.epub,
        start : classroomInfo.epub.start,
        end : classroomInfo.epub.end,
    });
};

classroomCommand.sendCloseEpub = function () {
    classroomInfo.epub.state = false;
    connection.send({
        epub : {
            state : false
        }
    });
};

classroomCommand.openEpub = function () {
    if(isSharingEpub) {
        if(renditionBuffer) { 
            if(classroomInfo.allControl)                                                        
                renditionBuffer.display(classroomInfo.epub.page);
        }
    }
    else {
        loadEpubViewer ();
        $('#canvas-controller').show();
    }
    
    if(!connection.extra.roomOwner) {
        if(classroomInfo.allControl) 
        {        
            if(isSharingEpub) {       
                document.getElementById('next').style.display = "none";     
                document.getElementById('prev').style.display = "none";     
                document.getElementById('lnext').style.display = "none";     
                document.getElementById('lprev').style.display = "none";  
                document.getElementsByClassName("thumbnail")
                $(".thumbnail").css("pointer-events", "none")
            }
        }
        else 
        {
            if(isSharingEpub) {      
                document.getElementById('next').style.display = "block";     
                document.getElementById('prev').style.display = "block";     
                document.getElementById('lnext').style.display = "block";     
                document.getElementById('lprev').style.display = "block";   
                $(".thumbnail").css("pointer-events", "");
            }
        }

    }
};

classroomCommand.closeEpub = function () {
    unloadEpubViewer();
    $('#canvas-controller').hide();
}

classroomCommand.sendEpubCmd = function (_cmd, _data) {
    
    if(!connection.extra.roomOwner) return;    
    if(classroomInfo.epub.page == _data.page)   return;

    classroomInfo.epub.page = _data.page;

    if(!classroomInfo.allControl) return;
    console.log(_data);
    connection.send ({
        epub : {
            cmd : _cmd,
            data : _data         
        }
    });
}

classroomCommand.updateEpubCmd = function (_data) {

    console.log(_data);

    let frame = document
    .getElementById('widget-container')
    .getElementsByTagName('iframe')[0].contentWindow;
    let epubViewer = frame.document.getElementById('epub-viewer');
    if(!epubViewer)  return;

    console.log('page');
    switch(_data.cmd)
    {
        case 'page' :            
            let page = _data.data.page;           
            if(classroomInfo.epub.page != page) {
                classroomInfo.epub.page = page;
                if(renditionBuffer) {                                                
                    renditionBuffer.display(page);
                }
            }
            break;

        case 'next' :
            document.getElementById('next').click();
            break;
        case 'prev' :
            document.getElementById('prev').click();
            break;
    }
}

classroomCommand.syncEpub = function () {    
    if(classroomInfo.epub.state) {
        // open
        classroomCommand.openEpub ();
    }
    else {
        // close        
        classroomCommand.closeEpub ();     
    }
};


/*
    방 오픈 경과 시간 동기화
*/
classroomCommand.syncClassroomOpenTime =  function () {    
    updateClassTime ();
};


//--------------------------------------------------------------------------------//

teacherCommand =  {


}


studentCommand = {

    sendStudentToTeachCmd : function (_cmd, _data) {
        if(connection.extra.roomOwner)  return;    
        connection.send ({
            studentCmd : {
                from : connection.userid,
                cmd : _cmd,
                data : _data
            }        
        })
    },

    sendPdfPage : function (_page) {        
        this.sendStudentToTeachCmd ('pdf-page', _page);
    },
}




/*
    학생이 선생님한테 보내는 메시지    
*/
// classroomCommand.sendStudentToTeachCmd = function (_cmd, _data) {
//     if(connection.extra.roomOwner)  return;

//     connection.send ({
//         studentCmd : {
//             from : connection.userid,
//             cmd : _cmd,
//             data : _data
//         }        
//     })
// }

