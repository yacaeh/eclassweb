class AlertBox extends React.Component {
    render() {
        return <div id="alert-box" className="modal" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div id="alert-dialog">
                <div id="alert-header"><span id="alert-title" data-i18n="NOTIFICATION">알림</span></div>
                <div id="alert-body">
                    <div id="alert-content" />
                    <div id="alert-btns">
                        <button className="btn btn-alert-yes" style={{ paddingTop: '0px' }} data-i18n="YES">예</button>
                        <button className="btn btn-alert-no" style={{ paddingTop: '0px' }} data-i18n="NO">아니요</button>
                    </div>
                </div>
                <div id="alert-footer"></div>
            </div>
        </div>
    }
}