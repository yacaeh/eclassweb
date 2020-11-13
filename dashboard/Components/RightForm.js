class RightForm extends React.Component {
    state = {
        collapsed: false
    }

    render() {
        return (
            <div id="right-tab" className="right-tab">

                <div id="right-tab-collapse" onClick={this.collapse}>
                    <img src="/dashboard/img/openchat.png" />
                </div>

                <span className="nos">
                    <span className="nos_student_text" id="nos">0</span>
                    <img className="nos_student_icon" src="/dashboard/img/student2.png" />
                </span>

                <StudentList />
                <MainCam />
                <ChattingWindow />
            </div>
        )
    }

    collapse = (e) => {
        this.setState({ collapsed: !this.state.collapsed })
        if (!this.state.collapsed) {
            e.target.style.transform = "rotate(90deg)";
            $(rightTab).animate({ width: "0%" });
            $(widgetContainer).animate({ right: "0%" }, classroomManager.canvasResize);
        }
        else {
            e.target.style.transform = "rotate(-90deg)";
            $(rightTab).animate({ width: "17.7%" });
            $(widgetContainer).animate({ right: "17.7%" }, classroomManager.canvasResize);
        }
    }
}

class StudentList extends React.Component {
    render() {
        return <div id="student_list">
            <div id="student_list_button" />
        </div>
    }
}

class MainCam extends React.Component {
    render() {
        return <video id="main-video" playsInline autoPlay />
    }
}