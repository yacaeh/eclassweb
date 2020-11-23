
class AllControll extends React.Component {
    state = {
        on: false
    }
    constructor(props){
        super(props);
    }

    render() {
        return <img 
        onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave}
        className={"top_icon " + (this.state.on ? 'top_all_controll_on' : 'top_all_controll_off')}  
        id="top_all_controll" 
        data-des={GetLang('MANAGE_ALL')} 
        onClick={this.clickHandler} />
    };

     clickHandler = () => {
        classroomInfo.allControl = !classroomInfo.allControl;
        this.setState({ on: classroomInfo.allControl });
        classroomManager.updateClassroomInfo(() => this.updateControlView(true));
    };

    updateControlView(send) {
        if (send) {
            classroomInfo.allControl ?
                connection.send({ allControl: { state: true, roomInfo: classroomInfo } }) :
                connection.send({ allControl: { state: false } });
        }
    }
}
