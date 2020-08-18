/*
    채팅
*/

ChattingManager = {
    noticeElement : undefined,
    normalElement : undefined,
    self : undefined,
    init : function(){
        this.noticeElement = document.getElementById('noticewindow');
        this.normalElement = document.getElementById('conversation-panel');
        this.self = this;
        self = this.self;
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
            placeholder: '메세지를 입력하세요',
        
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
                ChattingManager.normal("나", chatMessage);
                if(connection.extra.roomOwner)
                    ChattingManager.notice(chatMessage);
                connection.send({
                    chatMessage : true,
                    msg : chatMessage,
                    name : connection.extra.userFullName
                })

            }
        };

    },
    append : function(event){
        var div = document.createElement('div');
        var color = "#000000"

        div.className = 'message';

        if (typeof event.extra.roomOwner != "undefined") {
            this.notice(event.data.msg);
        }

        if (event.data) {
            var id = event.extra.userFullName || event.userid;
            if (event.extra.roomOwner == true) {
                id += '(선생님)';
                color = "#C63EE8"
            }
        } 

        this.normal(id, event.data.msg, color);
    },
    enterStudent : function(event){
        var name = event.extra.userFullName;
        var div = document.createElement('div');
        div.className = 'teachermsg2 enter';
        div.innerHTML = '<b> <font color="#000000">' + name + ' </font>학생이 접속했습니다</b>';
        this.noticeElement.appendChild(div);
        this.noticeElement.scrollTop = this.noticeElement.clientHeight;
        this.noticeElement.scrollTop = this.noticeElement.scrollHeight - this.noticeElement.scrollTop;
    },
    leftStudent : function(event){
        var name = event.extra.userFullName;
        if(name == undefined)
            return;

        var div = document.createElement('div');
        div.className = 'teachermsg2 left';
        div.innerHTML = '<b> <font color="#000000">' + name + ' </font>학생이 나갔습니다</b>';
        this.noticeElement.appendChild(div);
        this.noticeElement.scrollTop = this.noticeElement.clientHeight;
        this.noticeElement.scrollTop = this.noticeElement.scrollHeight - this.noticeElement.scrollTop;
    },
    notice : function(msg){
        var div = document.createElement('div');
        div.className = 'teachermsg';
        div.innerHTML = '<b> <font color="#C63EE8"> 선생님 </font>: </b>' + msg;
        this.noticeElement.appendChild(div);
        this.noticeElement.scrollTop = this.noticeElement.clientHeight;
        this.noticeElement.scrollTop = this.noticeElement.scrollHeight - this.noticeElement.scrollTop;
    },
    normal : function(name, msg, color = "#3E93E8"){
        var div = document.createElement('div');
        div.className = 'message';
        div.innerHTML = '<b> <font color="' + color + '"> ' + name + ' </font>: </b>' + msg;
        this.normalElement.appendChild(div);
        this.normalElement.scrollTop = this.normalElement.clientHeight;
        this.normalElement.scrollTop = this.normalElement.scrollHeight - this.normalElement.scrollTop;
    },
    eventListener : function(event){
        if (event.data.chatMessage) {
            this.append(event);
            return true;
        }
    }
}
