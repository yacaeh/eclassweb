class ChattingManagerClass{
    constructor(){
        this.noticeElement = undefined;
        this.normalElement = undefined;
        this.self = undefined;
    }

    init(){
        this.noticeElement = document.getElementById('noticewindow');
        this.normalElement = document.getElementById('conversation-panel');
        var notice = document.getElementById("notice");
        var normal = document.getElementsByClassName('conversation-panel')[0];

        document.getElementById('collapse').addEventListener('click', function () {
            if (notice.classList.contains('on')) {
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
            notice.classList.toggle('off');
            notice.classList.toggle('on');
        });
        
        $('#txt-chat-message').emojioneArea({
            pickerPosition: 'top',
            filtersPosition: 'bottom',
            tones: false,
            autocomplete: true,
            inline: true,
            hidePickerOnBlur: true,
            placeholder: $.i18n( 'CHAT_PLACEHOLDER' ),
        
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
                if(connection.extra.roomOwner)
                    ChattingManager.notice(chatMessage);
                connection.send({
                    chatMessage : true,
                    msg : chatMessage,
                    name : connection.extra.userFullName
                })

            }
        };

    }
    append(event){
        let div = document.createElement('div');
        let color = "#000000"

        div.className = 'message';

        if (typeof event.extra.roomOwner != "undefined") {
            this.notice(event.data.msg);
        }

        let id;
        if (event.data) {
            id = event.extra.userFullName || event.userid;
            if (event.extra.roomOwner == true) {
                id += '('+$.i18n('TEACHER')+')';
                color = "#C63EE8"
            }
        } 

        this.normal(id, event.data.msg, color);
    }
    enterStudent(event){
        let name = event.extra.userFullName;
        let div = document.createElement('div');
        div.className = 'teachermsg2 enter';
        div.innerHTML = '<b> <font color="#000000">' + name + ' </font>'+$.i18n('STUDENT_JOIN')+'</b>';
        this.noticeElement.appendChild(div);
        this.noticeElement.scrollTop = this.noticeElement.clientHeight;
        this.noticeElement.scrollTop = this.noticeElement.scrollHeight - this.noticeElement.scrollTop;
    }
    leftStudent(event){
        let name = event.extra.userFullName;
        if(name == undefined)
            return;

        let div = document.createElement('div');
        div.className = 'teachermsg2 left';
        div.innerHTML = '<b> <font color="#000000">' + name + ' </font>'+$.i18n('STUDENT_LEFT')+'</b>';
        this.noticeElement.appendChild(div);
        this.noticeElement.scrollTop = this.noticeElement.clientHeight;
        this.noticeElement.scrollTop = this.noticeElement.scrollHeight - this.noticeElement.scrollTop;
    }
    notice(msg){
        let div = document.createElement('div');
        div.className = 'teachermsg';
        div.innerHTML = '<b> <font color="#C63EE8"> '+$.i18n('TEACHER')+' </font>: </b>' + msg;
        this.noticeElement.appendChild(div);
        this.noticeElement.scrollTop = this.noticeElement.clientHeight;
        this.noticeElement.scrollTop = this.noticeElement.scrollHeight - this.noticeElement.scrollTop;
    }
    normal(name, msg, color = "#3E93E8"){
        let div = document.createElement('div');
        div.className = 'message';
        div.innerHTML = '<b> <font color="' + color + '"> ' + name + ' </font>: </b>' + msg;
        this.normalElement.appendChild(div);
        this.normalElement.scrollTop = this.normalElement.clientHeight;
        this.normalElement.scrollTop = this.normalElement.scrollHeight - this.normalElement.scrollTop;
    }
    eventListener(event){
        if (event.data.chatMessage) {
            this.append(event);
            return true;
        }
    }
}

var ChattingManager = new ChattingManagerClass();