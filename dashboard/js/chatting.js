class ChattingManagerClass {
    constructor() {
        this.noticeElement = undefined;
        this.normalElement = undefined;
        this.self = undefined;
    }

    init() {
        this.noticeElement = document.getElementById('noticewindow');
        this.normalElement = document.getElementById('conversation-panel');

        $('#txt-chat-message').emojioneArea({
            pickerPosition: 'top',
            filtersPosition: 'bottom',
            tones: false,
            autocomplete: true,
            inline: true,
            hidePickerOnBlur: true,
            placeholder: $.i18n('CHAT_PLACEHOLDER'),
            events: {
                focus: function () {
                    $('.emojionearea-category')
                        .unbind('click')
                        .bind('click', function () {
                            $('.emojionearea-button-close').click();
                        });
                },
            },
        });
        
        window.onkeyup = function (e) {
            var code = e.keyCode || e.which;
            if (code == 13) {
                var chatMessage = $('.emojionearea-editor').html();
                $('.emojionearea-editor').html('');
                if (!chatMessage || !chatMessage.replace(/ /g, '').length) return;
                ChattingManager.normal($.i18n('ME'), chatMessage);
                if (connection.extra.roomOwner)
                    ChattingManager.notice(chatMessage);
                connection.send({
                    chatMessage: true,
                    msg: chatMessage,
                    name: connection.extra.userFullName
                })
            }
        };

    }
    append(event) {
        let div = document.createElement('div');
        let color = "#000000"
        let id;

        div.className = 'message';

        if (event.extra.roomOwner) {
            this.notice(event.data.msg);
        }

        if (event.data) {
            id = event.extra.userFullName || event.userid;
            if (event.extra.roomOwner) {
                id += '(' + $.i18n('TEACHER') + ')';
                color = "#C63EE8"
            }
        }

        this.normal(id, event.data.msg, color);
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
        if (name == undefined)
            return;

        let div = document.createElement('div');
        div.className = 'teachermsg2 left';
        div.innerHTML = '<b> <font color="#000000">' + name + ' </font>' + $.i18n('STUDENT_LEFT') + '</b>';
        this.noticeElement.appendChild(div);
        this.noticeElement.scrollTop = this.noticeElement.clientHeight;
        this.noticeElement.scrollTop = this.noticeElement.scrollHeight - this.noticeElement.scrollTop;
    }
    notice(msg) {
        let div = document.createElement('div');
        div.className = 'teachermsg';
        div.innerHTML = '<b> <font color="#C63EE8"> ' + $.i18n('TEACHER') + ' </font>: </b>' + msg;
        this.noticeElement.appendChild(div);
        this.noticeElement.scrollTop = this.noticeElement.clientHeight;
        this.noticeElement.scrollTop = this.noticeElement.scrollHeight - this.noticeElement.scrollTop;
    }
    normal(name, msg, color = "#3E93E8") {
        let div = document.createElement('div');
        div.className = 'message';
        div.innerHTML = '<b> <font color="' + color + '"> ' + name + ' </font>: </b>' + msg;
        this.normalElement.appendChild(div);
        this.normalElement.scrollTop = this.normalElement.clientHeight;
        this.normalElement.scrollTop = this.normalElement.scrollHeight - this.normalElement.scrollTop;
    }
    eventListener(event) {
        if (event.data.chatMessage) {
            this.append(event);
            return true;
        }
    }
}

var ChattingManager = new ChattingManagerClass();