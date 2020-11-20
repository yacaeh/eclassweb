class AlertBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            content: '',
            text_yes : '',
            text_no : '',
            removeNo : false,
            yes : function(){},
            no : function(){$('#alert-box').fadeOut(300)},
        }
    };

    render() {
        return <div id="alert-box" className="modal" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div id="alert-dialog">
                <div id="alert-header">
                    <span id="alert-title">
                        {this.state.title}
                    </span>
                </div>
                <div id="alert-body">
                    <div id="alert-content">
                        {this.state.content}
                    </div>
                    <div id="alert-btns">
                        <AlertBtn_Yes text={this.state.text_yes} onClick={this.state.yes} />
                        {!this.state.removeNo && <AlertBtn_No text={this.state.text_no} onClick={this.state.no}/>} 
                    </div>
                </div>
                <div id="alert-footer" />
            </div>
        </div>
    }

    componentDidMount() {
        reactEvent.AlertBox = (data) => {
            $('#alert-box').fadeIn(300);
            data.text_yes = window.langlist.YES;
            data.text_no = window.langlist.NO;
            data.removeNo = data.removeNo || false;
            this.setState(data);
        }
    }
}

function AlertBtn_Yes(props) {
    return <button className="btn btn-alert-yes" onClick={() => {props.onClick(); $('#alert-box').fadeOut(300)}} style={{ paddingTop: '0px' }}>{props.text}</button>
}

function AlertBtn_No(props) {
    return <button className="btn btn-alert-no" onClick={() => {props.onClick(); $('#alert-box').fadeOut(300)}} style={{ paddingTop: '0px' }}>{props.text}</button>
}