class ChattingManagerClass {
    constructor() {
        this.noticeElement = undefined;
        this.normalElement = undefined;
        this.self = undefined;
    }

    init() {
        this.noticeElement = document.getElementById('noticewindow');
        this.normalElement = document.getElementById('conversation-panel');
    }
   
    enterStudent(name) {
        let div = document.createElement('div');
        div.className = 'teachermsg2 enter';
        div.innerHTML = '<b> <font color="#000000">' + name + ' </font>' + $.i18n('STUDENT_JOIN') + '</b>';
        this.noticeElement.appendChild(div);
        this.noticeElement.scrollTop = this.noticeElement.clientHeight;
        this.noticeElement.scrollTop = this.noticeElement.scrollHeight - this.noticeElement.scrollTop;
    }

    leftStudent(name) {
        if (name == undefined) return;
        let div = document.createElement('div');
        div.className = 'teachermsg2 left';
        div.innerHTML = '<b> <font color="#000000">' + name + ' </font>' + $.i18n('STUDENT_LEFT') + '</b>';
        this.noticeElement.appendChild(div);
        this.noticeElement.scrollTop = this.noticeElement.clientHeight;
        this.noticeElement.scrollTop = this.noticeElement.scrollHeight - this.noticeElement.scrollTop;
    }

    eventListener(event) {
        if (event.data.chatMessage) {
            reactEvent.chatting(event);
            return true;
        }
    }
}

var ChattingManager = new ChattingManagerClass();