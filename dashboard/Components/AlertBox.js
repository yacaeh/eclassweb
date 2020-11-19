class AlertBox extends React.Component {
    render() {
        return <div id="alert-box" className="modal" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div id="alert-dialog">
                <div id="alert-header"><span id="alert-title" /></div>
                <div id="alert-body">
                    <div id="alert-content" />
                    <div id="alert-btns">
                        <AlertBtn_Yes />
                        <AlertBtn_No />
                    </div>
                </div>
                <div id="alert-footer" />
            </div>
        </div>
    }
}

function AlertBtn_Yes(){
    return <button className="btn btn-alert-yes" style={{ paddingTop: '0px' }}/>
}

function AlertBtn_No(){
    return <button className="btn btn-alert-no" style={{ paddingTop: '0px' }}/>
}