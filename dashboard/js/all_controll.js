/*
    전체 제어 관련
*/

var top_all_controll_jthis;

function updateControlView(send) {
    if (classroomInfo.allControl) {
        top_all_controll_jthis.addClass('top_all_controll_on');
        top_all_controll_jthis.removeClass('top_all_controll_off')
    }
    else {
        top_all_controll_jthis.addClass('top_all_controll_off');
        top_all_controll_jthis.removeClass('top_all_controll_on')
    }

    if (send == true) {
        classroomInfo.allControl ? connection.send({allControl: {state: true,roomInfo: classroomInfo}})
                                 : connection.send({allControl: {state: false}});
    }
}

function onAllControlValue(_allControl) {
    classroomInfo.allControl = _allControl.state;
    if (classroomInfo.allControl) {
        console.log("All Controll On");
        Show("student-isallcontrol")
        classroomCommand.onSynchronizationClassRoom(_allControl.roomInfo)
    }
    else {
        console.log("All Controll Off");
        Hide("student-isallcontrol")
        classroomCommand.updateSyncRoom();
    }
}

function _AllCantrallFunc() {
    top_all_controll_jthis = $("#top_all_controll");
    top_all_controll_jthis.click(() => {
        connection.socket.emit('toggle-all-control', (changeControl) => {
            classroomInfo.allControl = changeControl;
            updateControlView(true);
        });
    })
}
