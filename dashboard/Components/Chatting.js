
class ChattingWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
            collapse: false,
            chattingLogs: [],
            notice: [],
            chat: '',
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
                <input onChange={this.onChangeInput} placeholder={GetLang('CHAT_PLACEHOLDER')} value={this.state.chat} id="txt-chat-message" />
            </div>
        </div>
    };

    onChangeInput(e) {
        this.setState({ chat: e.target.value });
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
                    name: window.langlist.ME,
                }

                _this.setState({
                    chat: '',
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
            normal.style.height = '85%';
            notice.style.height = '8%';
            notice.style.borderBottom = '0px solid gray';
            notice.lastElementChild.lastElementChild.style.transform = 'rotate(0deg)';
        } else {
            notice.style.height = '50%';
            normal.style.height = '44%';
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
            <div ref={this.window} className="scroll" id="conversation-panel">
                {list}
            </div>

        </div>
    }

    componentDidUpdate() {
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


    componentDidUpdate() {
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.window.current.scrollTop = this.window.current.clientHeight;
        this.window.current.scrollTop = this.window.current.scrollHeight - this.window.current.scrollTop;
    }


    render() {
        const list = this.props.list.map((data, idx) => <this.Chat data={data} key={idx} />);

        const noticeStyle = {
            overflow: 'auto',
            right: '0px',
            top: '40px',
            position: 'absolute',
            left: '10px',
            bottom: '25px',
            overflowX: 'hidden',
            overflowY: 'auto',
        }

        return <div id="notice">
            <span className="text">{GetLang('TEACHER_CHAT')}<h1 /></span>
            <div ref={this.window} className="scroll" id="noticewindow" style={noticeStyle}>
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
            <b><font color="#C63EE8">{window.langlist.TEACHER}</font></b> : {params.data.msg}
        </div>
    }
}
