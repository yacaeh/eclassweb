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
            no : this.hide,
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
                        {this.state.content == 'attention' ? 
                            <progress max='100' value='100' className='alert-progress exam-state-progress'></progress> : 
                            this.state.content
                        }
                    </div>
                    <div id="alert-btns">
                        <AlertBtn_Yes width={this.state.removeNo ? "100%" : "50%"} hide={this.hide} text={this.state.text_yes} onClick={this.state.yes} />
                        {!this.state.removeNo && <AlertBtn_No hide={this.hide} text={this.state.text_no} onClick={this.state.no}/>} 
                    </div>
                </div>
                <div id="alert-footer" />
            </div>
        </div>
    }

    componentDidMount() {
        reactEvent.AlertBox = (data) => {
            this.show();
            data.text_yes = data.removeNo ? GetLang('CONFIRM') : GetLang('YES');
            data.text_no = GetLang('NO');
            data.removeNo = data.removeNo || false;
            this.setState(data);
        }
    }

    show(){
        document.getElementById("right-tab").style.zIndex = -1;
        document.getElementById("header").style.zIndex = -1;
        document.getElementById("tool-box").style.zIndex = -1;
        $('#alert-box').fadeIn(300);
    }
    
    hide(){
        $('#alert-box').fadeOut(300,() =>{
            document.getElementById("right-tab").style.zIndex = 2;
            document.getElementById("header").style.zIndex = 5;
            document.getElementById("tool-box").style.zIndex = 10001;
        })
    }
}

function AlertBtn_Yes(props) {
    return <button className="btn btn-alert-yes" 
    onClick={() => {
        props.onClick(); 
        props.hide()}} 
        style={{ 
            width   : props.width,
            paddingTop: '0px' 
        }}>{props.text}</button>
}

function AlertBtn_No(props) {
    return <button className="btn btn-alert-no" 
    onClick={() => {
        props.onClick(); 
        props.hide()}} 
        style={{ paddingTop: '0px' }}>{props.text}</button>
}