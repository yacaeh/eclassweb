/*
    전체 제어 관련
*/

var top_all_controll_jthis;

function updateControlView(send) {
    if (connection.extra.roomOwner) {
        if (classroomInfo.allControl) {
            top_all_controll_jthis.addClass('top_all_controll_on');
            top_all_controll_jthis.removeClass('top_all_controll_off')
        }
        else {
            top_all_controll_jthis.addClass('top_all_controll_off');
            top_all_controll_jthis.removeClass('top_all_controll_on')
        }
    }
    else {
        classroomInfo.allControl ? Show("student-isallcontrol") : Hide("student-isallcontrol");
    }


    if (send == true) {
        classroomInfo.allControl ? connection.send({ allControl: { state: true, roomInfo: classroomInfo } })
            : connection.send({ allControl: { state: false } });
    }
}

function onAllControlValue(_allControl) {
    classroomInfo.allControl = _allControl.state;
    if (classroomInfo.allControl) {
        console.debug("All Controll On");
        Show("student_isallcontrol")
        classroomCommand.onSynchronizationClassRoom(_allControl.roomInfo)
    }
    else {
        console.debug("All Controll Off");
        Hide("student_isallcontrol")
        classroomCommand.updateSyncRoom();
    }
}

function _AllCantrallFunc() {
    top_all_controll_jthis = $("#top_all_controll");
    top_all_controll_jthis.click(() => {
        classroomInfo.allControl = !classroomInfo.allControl;
        classroomManager.updateClassroomInfo(() => updateControlView(true));
    })
}
