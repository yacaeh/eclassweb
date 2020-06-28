

function allControllEnable(jthis, b, send)
{
    classroomInfo.allControl = b;

    if(classroomInfo.allControl)
    {
        jthis.addClass('top_all_controll_on');
        jthis.removeClass('top_all_controll_off')
    }
    else{
        jthis.addClass('top_all_controll_off');
        jthis.removeClass('top_all_controll_on')
    }

    if(send == true)
    {
        SendAllControll(classroomInfo.allControl);
    }
}


var top_all_controll_jthis;

function _AllCantrallFunc() {

    top_all_controll_jthis = $("#top_all_controll");
    if(params.open == "true")
    {
        top_all_controll_jthis.click(function(){
            //_3dcanvas.toggle();
            

            allControllEnable(top_all_controll_jthis, !classroomInfo.allControl, true);

        })
    }

}


function SendAllControll(b)
{
    connection.send({
        allControl: b
    });
}