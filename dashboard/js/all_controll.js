
var top_all_controll_jthis;


function updateControlView(send)
{
    if(classroomInfo.allControl)
    {
        top_all_controll_jthis.addClass('top_all_controll_on');
        top_all_controll_jthis.removeClass('top_all_controll_off')
    }
    else{
        top_all_controll_jthis.addClass('top_all_controll_off');
        top_all_controll_jthis.removeClass('top_all_controll_on')
    }

    if(send == true)
    {
        SendAllControll(classroomInfo.allControl);
    }
}


function onAllControlValue (_allControl) {    
    classroomInfo.allControl = _allControl.state;  
    if(classroomInfo.allControl) {        
        //  전체제어하기가 걸리게 되면, 현재 상태와 동기화 시킨다.
        console.log("All Controll On");
        document.getElementById("student-isallcontrol").style.display = "block";
        classroomCommand.onSynchronizationClassRoom(_allControl.roomInfo)
    }
    else
    {
        document.getElementById("student-isallcontrol").style.display = "none";
        console.log("All Controll Off");
        classroomCommand.updateSyncRoom ();
        // updateControlView (false);   
    }
}



function _AllCantrallFunc() {

    top_all_controll_jthis = $("#top_all_controll");
    if(params.open == "true")
    {
        top_all_controll_jthis.click(function(){
            connection.socket.emit('toggle-all-control', (changeControl) => {
                classroomInfo.allControl = changeControl;
                updateControlView (true);        
                //setAllControlValueWithSend (changeControl);
            });
        })
    }
}


function SendAllControll(b)
{
    if(b) {
        // true면 방의 정보를 다시 보낸다.
        console.log("")
        connection.send({
            allControl: {
                state : b,
                roomInfo : classroomInfo
            }
        });
    }
    else
    {
        // false 면 일반 값만 보낸다.
        connection.send({
            allControl:  {
                state : b
            }
        });
    }
}