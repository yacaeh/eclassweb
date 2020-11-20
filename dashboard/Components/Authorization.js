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
            <label>{GetLang('STUDENT_SHARE_SCREEN')}</label>
            <span id="classP" className="perbtn off">
                <span className="circle" />
            </span>
        </div>
    };

    Mic() {
        return <div className="mic" >
            <label>{GetLang('STUDENT_SHARE_MIC')}</label>
            <span id="micP" className="perbtn off">
                <span className="circle" />
            </span>
        </div>
    }

    Canvas() {
        return <div className="canper">
            <label>{GetLang('STUDENT_SHARE_CANVAS')}</label>
            <span id="canP" className="perbtn off">
                <span className="circle" />
            </span>
        </div>
    }
}
