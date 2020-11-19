
class ChattingWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
            collapse : false,
            chattingLogs: [],
            notice: [],
            chat : '',
        };

        this.collapse = this.collapse.bind(this);
        this.onChangeInput = this.onChangeInput.bind(this);
        this.notice = React.createRef();
        this.normal = React.createRef();
    };


    render() {
        return <div id="chatting">
            <Notice ref={this.notice} list={this.state.notice} collapse={this.collapse} />
            <ConversationPanel ref={this.normal} list={this.state.chattingLogs} />
            <div className="chatbackground">
                <input onChange={this.onChangeInput} value={this.state.chat} id="txt-chat-message"/>
            </div>
        </div>
    };

    onChangeInput(e) {
        this.setState({chat : e.target.value});
    }

    componentDidMount() {
        let _this = this;
        window.onkeyup = (e) => {
            let code = e.keyCode || e.which;
            if (code == 13) {
                let chatMessage = this.state.chat;
                if (!chatMessage || !chatMessage.replace(/ /g, '').length) return;

                let data = {
                    owner: connection.extra.roomOwner,
                    msg: chatMessage,
                    fromMe: true,
                    name: $.i18n('ME'),
                }

                _this.setState({ 
                    chat : '',
                    chattingLogs: _this.state.chattingLogs.concat(data)
                }, () => _this.scrollDown);
                connection.extra.roomOwner && _this.setState({ notice: _this.state.notice.concat(data) }, () => _this.scrollDown)

                connection.send({
                    chatMessage: true,
                    msg: chatMessage,
                    name: connection.extra.userFullName
                })
            }
        };

        reactEvent.chatting = function (event) {
            let data = {
                owner: event.extra.roomOwner,
                msg: event.data.msg,
                name: event.data.name,
                fromMe: false,
            }
            data.owner && _this.setState({ notice: _this.state.notice.concat(data) })
            _this.setState({ chattingLogs: _this.state.chattingLogs.concat(data) });
        }
    }

    collapse() {
        let notice = ReactDOM.findDOMNode(this.notice.current);
        let normal = ReactDOM.findDOMNode(this.normal.current);
        this.setState({ show: !this.state.show })

        if (this.state.show) {
            $(notice).animate({
                height: '8%',
                borderBottom: '0px solid gray',
            });
            $(normal).animate({ height: '85%' });
            notice.style.borderBottom = '0px solid #ffffff';
            notice.lastElementChild.lastElementChild.style.transform = 'rotate(0deg)';
        } else {
            $(notice).animate({
                height: '50%',
                borderBottom: '0px solid gray',
            });
            $(normal).animate({ height: '44%' });
            notice.style.borderBottom = '1px solid #B8B8B8';
            notice.lastElementChild.lastElementChild.style.transform = 'rotate(180deg)';
        }
    };
}


class ConversationPanel extends React.Component {
    constructor(props) {
        super(props);
        this.window = React.createRef();
        this.scrollToBottom = this.scrollToBottom.bind(this);
    };

    render() {
        const list = this.props.list.map((data, idx) => <this.Chat data={data} key={idx} />);
        return <div className="conversation-panel">
            <div ref={this.window}  className="scroll" id="conversation-panel">
                {list}
            </div>

        </div>
    }

    componentDidUpdate(){
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.window.current.scrollTop = this.window.current.clientHeight;
        this.window.current.scrollTop = this.window.current.scrollHeight - this.window.current.scrollTop;
    }


    Chat(params) {
        return <div className='message'>
            <b><font color={params.data.fromMe ? "#3E93E8" : 'black'}>{params.data.name}</font></b> : {params.data.msg}
        </div>
    }
}

class Notice extends React.Component {
    constructor(props) {
        super(props);
        this.window = React.createRef();
        this.scrollToBottom = this.scrollToBottom.bind(this);
    };


    componentDidUpdate(){
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.window.current.scrollTop = this.window.current.clientHeight;
        this.window.current.scrollTop = this.window.current.scrollHeight - this.window.current.scrollTop;
    }


    render() {
        const list = this.props.list.map((data, idx) => <this.Chat data={data} key={idx} />);

        return <div id="notice">
            <span className="text" data-i18n="TEACHER_CHAT">선생님 채팅<h1 /></span>
            <div ref={this.window} className="scroll" id="noticewindow">
                Logs<br />
                <div id="logs">
                </div>
                    {list}
            </div>

            <div id="collapse" onClick={this.props.collapse}>
                <img className="btn" src="/dashboard/img/openchat.png" />
            </div>
        </div>
    }

    Chat(params) {
        return <div className='teachermsg'>
            <b><font color="#C63EE8">{$.i18n('TEACHER')}</font></b> : {params.data.msg}
        </div>
    }
}
