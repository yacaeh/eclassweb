
class ChattingWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
            chattingLogs: [],
            notice: [],
            chat: '',
        };

        this.collapse = this.collapse.bind(this);
        this.onChangeInput = this.onChangeInput.bind(this);
    };


    render() {
        return <div id="chatting">
            {this.state.show && <Notice show={this.state.show} list={this.state.notice} />}
            
            <div id="collapse" onClick={this.collapse}>
                <img style={{
                    transform: 'rotate(' + (this.state.show ? "180" : "0") + 'deg)'
                }} className="btn" src="/dashboard/img/openchat.png" />
            </div>

            <ConversationPanel show={this.state.show} list={this.state.chattingLogs} />
            <div className="chatbackground">
                <input onChange={this.onChangeInput} placeholder={GetLang('CHAT_PLACEHOLDER')} value={this.state.chat} id="txt-chat-message" />
            </div>
        </div>
    };

    collapse() {
        this.setState({ show: !this.state.show })
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

        reactEvent.enterOrExit = function (name, owner, event) {
            let data = {
                enterOrExitEvent: true,
                enterOrExit: event == "ENTER",
                name: name,
                fromMe: false,
                isOwner : owner
            }
            _this.setState({ notice: _this.state.notice.concat(data) });
        }
    }

}


class ConversationPanel extends React.Component {
    constructor(props) {
        super(props);
        this.window = React.createRef();
        this.scrollToBottom = this.scrollToBottom.bind(this);
    };

    render() {
        const list = this.props.list.map((data, idx) => <this.Chat data={data} key={idx} />);
        return <div style={{
            height: this.props.show ? "53%" : "85%"
        }} className="conversation-panel">
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
            <b><font color={params.data.fromMe ? "#3E93E8" : 'black'}>{params.data.fromMe ? GetLang("ME") : params.data.name}</font></b> : {params.data.msg}
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

        return <div id="notice" style={{
            height: this.props.show ? "40%" : "8%",
            borderBottom: this.props.show ? '1px solid gray' : '0px solid gray'
        }}>
            <span className="text">{GetLang('TEACHER_CHAT')}<h1 /></span>
            <div ref={this.window} className="scroll" id="noticewindow" style={noticeStyle}>
                Logs<br />
                <div id="logs" />
                {list}
            </div>

        </div>
    }

    Chat(params) {
        if (params.data.enterOrExitEvent) {
            return <div className={'teachermsg2 ' + (params.data.enterOrExit ? "enter" : "left")}>
                <b>
                    <font color='#000000'>
                        {params.data.name}
                    </font>

                    {params.data.enterOrExit ? 
                        params.data.isOwner ? GetLang('TEACHER_JOIN') : GetLang("STUDENT_JOIN") :
                        params.data.isOwner ? GetLang('TEACHER_LEFT') : GetLang("STUDENT_LEFT") 
                    }
                </b>
            </div>
        } else {
            return <div className='teachermsg'>
                <b><font color="#C63EE8">{GetLang('TEACHER')}</font></b> : {params.data.msg}
            </div>
        }
    }
}
