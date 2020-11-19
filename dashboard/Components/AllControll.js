
class AllControll extends React.Component {
    state = {
        on: false
    }

    render() {
        return <img className="top_icon top_all_controll_off" id="top_all_controll" onClick={this.clickHandler} />
    };

    clickHandler = (e) => {
        console.log(e);
        if (!this.state.on) {
            e.target.classList.add('top_all_controll_on');
            e.target.classList.remove('top_all_controll_off')
        }
        else {
            e.target.classList.add('top_all_controll_off');
            e.target.classList.remove('top_all_controll_on')
        }
        classroomInfo.allControl = !classroomInfo.allControl;
        this.setState({ on: classroomInfo.allControl });
        classroomManager.updateClassroomInfo(() => this.updateControlView(true));
    };

    updateControlView(send) {
        if (!connection.extra.roomOwner) {
            classroomInfo.allControl ? Show("student_isallcontrol") : Hide("student_isallcontrol");
        }
        if (send) {
            classroomInfo.allControl ?
                connection.send({ allControl: { state: true, roomInfo: classroomInfo } }) :
                connection.send({ allControl: { state: false } });
        }
    }
}

function onAllControlValue(_allControl) {
    classroomInfo.allControl = _allControl.state;
    if (classroomInfo.allControl) {
        console.debug("All Controll On", _allControl);
        document.getElementById("student_isallcontrol").style.display = 'block';
        classroomCommand.onSynchronizationClassRoom(_allControl.roomInfo)
    }
    else {
        console.debug("All Controll Off");
        document.getElementById("student_isallcontrol").style.display = 'none';
        classroomCommand.updateSyncRoom();
    }
}
