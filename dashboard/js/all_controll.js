/*
    전체 제어 관련
*/

var top_all_controll_jthis;


function onAllControlValue(_allControl) {
    classroomInfo.allControl = _allControl.state;
    if (classroomInfo.allControl) {
        console.debug("All Controll On", _allControl);
        Show("student_isallcontrol")
        classroomCommand.onSynchronizationClassRoom(_allControl.roomInfo)
    }
    else {
        console.debug("All Controll Off");
        Hide("student_isallcontrol")
        classroomCommand.updateSyncRoom();
    }
}
