
classroomInfo = {   
    roomOpenTime : 0,       // 방을 처음 개설한 시간
    allControl : false,
    shareScreen : {
        state : false,
        id : undefined
    },
    share3D : {
        state : false,
        data : { }   // position, rotation 
    },
    pdf : {
        state : false,
        src : 'https://localhost:9001/ViewerJS/#https://files.primom.co.kr/test.pdf',
        page : 1
       // 어떤 pdf, 몇 페이지 등
    },
    epub : {
        state : false,
        page : 1,
        data : {
            src : 'https://files.primom.co.kr/epub/fca2229a-860a-6148-96fb-35eef8b43306/Lesson07.epub/ops/content.opf'
        }   // 어떤 pdf, 몇 페이지 등
    },
    exam : false    
};

classroomInfoLocal = {
    allControl : false,
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
            classroomInfo.roomOpenTime = _info.roomOpenTime;
            classroomInfo.allControl = _info.allControl;
            classroomInfo.shareScreen.state = _info.shareScreen;
            classroomInfo.share3D.state = _info.share3D.state;
            classroomInfo.pdf.state = _info.pdf.state;
            classroomInfo.exam = _info.exam;

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
    },
    
    
    //  Global Data를 Local에 Copy.
    copyGlobalToLocal : function() {
        classroomInfoLocal.allControl = classroomInfo.allControl;
        classroomInfoLocal.shareScreen = classroomInfo.shareScreen;
        classroomInfoLocal.share3D = classroomInfo.share3D;
        classroomInfoLocal.pdf = classroomInfo.pdf;
        classroomInfoLocal.epub = classroomInfo.epub;
        classroomInfoLocal.exam = classroomInfo.exam;
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
            classroomCommand.syncPdf ();
        }
        if(classroomInfo.epub.state) {
            classroomCommand.openEpub ();
        }

        if(classroomInfo.shareScreen.state){
            classroomCommand.openShare();
        }
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
    // console.log("NEW")
    // var id= classroomInfo.shareScreen.id;
    // connection.peers.forEach(function(e){
    //     var userid = e.userid;
    //     if(classroomInfo.shareScreen.userid != userid)  return;
    //     e.streams.forEach(function(stream){
    //         console.log(stream);
    //       if(stream.streamid == id){

    //           console.log("LOAD STREAM", stream)
    //           var screenTrackId = stream.getTracks()[0].id;
    //           console.log(stream.getTracks())
    //           stream.getTracks().forEach(function (track) {
    //             if (track.kind === 'video' && track.readyState === 'live') {
    //                 replaceTrackToPeer(userid, track, screenTrackId);
    //             }
    //           });
    //         // document.getElementById("screen-viewer").srcObject = stream;
    //       }
    //     })
    //   })
    // document.getElementById("screen-viewer").style.display = 'block';
}


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
classroomCommand.setShareScreenServer = function (_data, success, error) {    
    connection.socket.emit('set-share-screen', _data, result => {  
        if(result.result)
            success ();
        else 
            error (result.error);
    });
};

classroomCommand.setShareScreenLocal = function (_data) {
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
classroomCommand.togglePdfStateServer = function (_success, _error) {

    connection.socket.emit('toggle-share-pdf', (result) => {
        if(result.result) 
        {
            classroomCommand.setPdfStateLocal(result.data);
            if(result.data)                
                classroomCommand.sendPDFCmdOnlyTeacher ('open', {page : classroomInfo.pdf.page});
            else
                classroomCommand.sendPDFCmdOnlyTeacher ('close');
                
            if(_success)
                _success(result.data)
        }
        else 
        {
            if(_error)
                _error(result.error);
        }
    });
}


classroomCommand.setPdfStateLocal = function (_state) {
    if(classroomInfo.pdf.state != _state) {
        classroomInfo.pdf.state = _state;        
        classroomCommand.syncPdf ();
    }
}

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

classroomCommand.setPdfPage = function (_page) {    
    classroomInfo.pdf.page = _page;
    if(connection.extra.roomOwner)
        classroomCommand.sendPDFCmdAllControlOnlyTeacher ('page', _page);
    else {
        studentCommand.sendPdfPage (_page);
    }
}


classroomCommand.sendPDFCmdOnlyTeacher = function (_cmd, _data) {
    if(!connection.extra.roomOwner) return;  

    classroomCommand.sendPDFCmd(_cmd, _data);
}

classroomCommand.sendPDFCmdAllControlOnlyTeacher = function(_cmd, _data) {
    if(!connection.extra.roomOwner) return;    
    if(!classroomInfo.allControl) return;

    classroomCommand.sendPDFCmd(_cmd, _data);
}

classroomCommand.sendPDFCmd = function (_cmd, _data) {
    
    connection.send ({
        pdf : {
            cmd : _cmd,
            data : _data
        }
    });
}

classroomCommand.updatePDFCmd = function (_pdf) {  
    const cmd = _pdf.cmd;

    if(cmd == 'open') {
        console.log(_pdf);
        classroomInfo.pdf.page = _pdf.data.page;
        classroomCommand.setPdfStateLocal (true);
        return;
    }
    else if(cmd == 'close') {
        classroomCommand.setPdfStateLocal (false);
    }
    else
    {
        let frame = document
        .getElementById('widget-container')
        .getElementsByTagName('iframe')[0].contentWindow;
        let fileViewer = frame.document.getElementById('file-viewer');
        if(!fileViewer)  return;
    
        switch(cmd)
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
            case 'page' :                        
                const page = _pdf.data;
                classroomInfo.pdf.page = page;  
                var e = new Event("change");
                $(fileViewer.contentWindow.document.getElementById("pageNumber")).val(page);
                fileViewer.contentWindow.document.getElementById("pageNumber").dispatchEvent (e);           
                break;
        }
    }
}

classroomCommand.syncPdf = function () {    
    if(classroomInfo.pdf.state) {
        if(isFileViewer)
        {
            //  현재 파일Viewer가 열려 있다면, 페이지만 동기화   
            classroomCommand.pdfOnLoaded ();      
        }
        else {
            // open
            loadFileViewer ();
            $('#canvas-controller').show();
        }
    }
    else {
        // close        
        if(isFileViewer) {
            unloadFileViewer();
            $('#canvas-controller').hide();
        }
    }
};


classroomCommand.pdfOnLoaded = function () {
    if(!classroomInfo.pdf.page)
        classroomInfo.pdf.page = 1;

    classroomCommand.updatePDFCmd ({
        cmd : 'page',
        data : classroomInfo.pdf.page
    });

    // 학생인 경우만 처리
    if(!connection.extra.roomOwner) {                
        studentCommand.sendPdfPage (classroomInfo.pdf.page);
        pdfViewerLock (classroomInfo.allControl);
    }
    
    function pdfViewerLock(_lock) {
        let frame = document
        .getElementById('widget-container')
        .getElementsByTagName('iframe')[0].contentWindow;
        let fileViewer = frame.document.getElementById('file-viewer');
        let viewer = fileViewer.contentWindow.document.getElementById("viewer")    
        console.log(fileViewer);                        
        if(_lock) {
            viewer.style.pointerEvents = 'none';
        }
        else{
            viewer.style.pointerEvents = '';
        }
    }
}

/*
    Epub
*/
classroomCommand.receiveEpubMessage = function (_epub) {  
    if(_epub.cmd) {
        classroomCommand.updateEpubCmd (_epub.cmd);
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
        epub : classroomInfo.epub
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
    loadEpubViewer ();
    $('#canvas-controller').show();
};

classroomCommand.closeEpub = function () {
    unloadEpubViewer();
    $('#canvas-controller').hide();
}

classroomCommand.sendEpubCmd = function (_cmd) {
    if(!connection.extra.roomOwner) return;    
    if(!classroomInfo.allControl) return;

    connection.send ({
        epub : {
            cmd : _cmd
        }
    });
}

classroomCommand.updateEpubCmd = function (_cmd) {

    let frame = document
    .getElementById('widget-container')
    .getElementsByTagName('iframe')[0].contentWindow;
    let epubViewer = frame.document.getElementById('epub-viewer');
    if(!epubViewer)  return;

    switch(_cmd)
    {
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


// 학생 pdf 페이지가 바뀔 때 호출 된다. 
classroomStudentsWatchInfo.onPdfPage =  function (student) {
    var id = student.userid;
    var page = student.pdfViewPage;

    console.log(student);
}


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

