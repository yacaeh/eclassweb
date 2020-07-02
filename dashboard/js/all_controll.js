
var top_all_controll_jthis;


var onAllControll = function () {};

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


function setAllControlValue (_state, _send) {
    classroomInfo.allControl = _state;
    updateControlView (_send);
}



function _AllCantrallFunc() {

    top_all_controll_jthis = $("#top_all_controll");
    if(params.open == "true")
    {
        top_all_controll_jthis.click(function(){
            connection.socket.emit('toggle-all-control', (changeControl) => {
                setAllControlValue (changeControl, true);
            });
        })
    }
}


function SendAllControll(b)
{
    if(b) {
        // true면 방의 정보를 다시 보낸다.

    }
    else
    {
        // false 면 일반 값만 보낸다.

    }

    connection.send({
        allControl: b
    });
}