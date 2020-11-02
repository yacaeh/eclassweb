
class ChattingWindow extends React.Component {
    state = {
        show: true
    };

    constructor(props) {
        super(props);
        this.collapse = this.collapse.bind(this);
    };

    render() {
        return (<>
            <div id="chatting" className="chatting">
                <Notice collapse={this.collapse} />
                <ConversationPanel />
            </div>
        </>
        )
    };

    collapse() {
        var notice = document.getElementById("notice");
        var normal = document.getElementsByClassName('conversation-panel')[0];

        this.setState({ show: !this.state.show })

        if (this.state.show) {
            $(notice).animate({
                height: '8%',
                borderBottom: '0px solid gray',
            });
            $(normal).animate({ height: '90%' });
            notice.style.borderBottom = '0px solid #ffffff';
            notice.lastElementChild.lastElementChild.style.transform = 'rotate(0deg)';
        } else {
            $(notice).animate({
                height: '50%',
                borderBottom: '0px solid gray',
            });
            $(normal).animate({ height: '48%' });
            notice.style.borderBottom = '1px solid #B8B8B8';
            notice.lastElementChild.lastElementChild.style.transform = 'rotate(180deg)';
        }
    };
}


class ConversationPanel extends React.Component {
    render() {
        return <div className="conversation-panel">
            <div className="chatbackground" />
            <div className="scroll" id="conversation-panel" />
            <textarea id="txt-chat-message" />
        </div>
    }
}

class Notice extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        return <div id="notice" className="on">
            <span className="text" data-i18n="TEACHER_CHAT">선생님 채팅<h1 /></span>
            <div className="scroll" id="noticewindow">
                Logs<br />
                <div id="logs" />
            </div>

            <div id="collapse" onClick={this.props.collapse}>
                <img className="btn" src="/dashboard/img/openchat.png" />
            </div>
        </div>
    }
}
