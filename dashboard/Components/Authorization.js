class Authorization extends React.Component {
    render() {
        return <div id="student-menu" style={{ display: 'none' }} className="student-menu shadow-5">
            <div className="stuname">이름</div>
            <div className="line1" />

            <this.ScreenShare />
            <this.Mic />
            <this.Canvas />
        </div>

    }

    ScreenShare() {
        return <div className="permission">
            <label id="STUDENT_SHARE_SCREEN">화면 공유</label>
            <span id="classP" className="perbtn off">
                <span className="circle" />
            </span>
        </div>
    };

    Mic() {
        return <div className="mic" >
            <label id="STUDENT_SHARE_MIC">마이크</label>
            <span id="micP" className="perbtn off">
                <span className="circle" />
            </span>
        </div>
    }

    Canvas() {
        return <div className="canper">
            <label id="STUDENT_SHARE_CANVAS">판서 공유</label>
            <span id="canP" className="perbtn off">
                <span className="circle" />
            </span>
        </div>
    }
}
