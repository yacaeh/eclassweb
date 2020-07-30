/////////////////////////////////////
// 채팅 /////////////////////////////
/////////////////////////////////////


function appendChatMessage(event) {
    var div = document.createElement('div');
    div.className = 'message';
    try {
        if (event.extra.roomOwner) {
            var notice = document.getElementById('noticewindow');
            $(notice).append(
                "<div class='teachermsg'> <font color='#C63EE8'> 선생님 </font> : " +
                ConvertChatMsg(event.data.chatMessage) +
                '</div>'
            );
            notice.scrollTop = notice.clientHeight;
            notice.scrollTop = notice.scrollHeight - notice.scrollTop;
        }
    } catch { }
    if (event.data) {
        var id = event.extra.userFullName || event.userid;
        if (event.extra.roomOwner == true) {
            id += '(선생님)';
            id = '<font color="#C63EE8">' + id + '</font>';
        }
        div.innerHTML =
            '<b>' + id + '</b> : ' + ConvertChatMsg(event.data.chatMessage);
        if (event.data.checkmark_id) {
            connection.send({
                checkmark: 'received',
                checkmark_id: event.data.checkmark_id,
            });
        }
    } else {
        div.innerHTML = '<b> <font color="#3E93E8"> 나 </font>: </b>' + ConvertChatMsg(event);

        if (params.open === 'true' || params.open === true) {
            var notice = document.getElementById('noticewindow');
            $(notice).append(
                "<div class='teachermsg'> <font color='#C63EE8'> 선생님 </font> : " +
                ConvertChatMsg(event) +
                '</div>'
            );
            notice.scrollTop = notice.clientHeight;
            notice.scrollTop = notice.scrollHeight - notice.scrollTop;
        }
    }

    conversationPanel.appendChild(div);
    conversationPanel.scrollTop = conversationPanel.clientHeight;
    conversationPanel.scrollTop = conversationPanel.scrollHeight - conversationPanel.scrollTop;
}

function ConvertChatMsg(_msg) {
    var div = document.createElement('span');
    div.innerHTML = _msg;
    var msg = $(div);
    var a = msg.find('a');
    if (a.length != 0) {
        console.log(div);
        a.attr('target', '_blank');
        return div.innerHTML;
    } else {
        return _msg;
    }
}

function SettingForChatting(){
        
    document.getElementById('collapse').addEventListener('click', function () {
        var notice = document.getElementById('notice');
        if (notice.classList.contains('on')) {
        $('#notice').animate({
            height: '8%',
            borderBottom: '0px solid gray',
        });
        $('.conversation-panel').animate({height: '88%'});
        console.log(this.children[0]);
        notice.children[0].style.borderBottom = '0px solid #ffffff';
        this.children[0].style.transform = 'rotate(0deg)';
        } else {
        $('#notice').animate({
            height: '50%',
            borderBottom: '0px solid gray',
        });
        $('.conversation-panel').animate({height: '48%'});
        notice.children[0].style.borderBottom = '1px solid #B8B8B8';
        this.children[0].style.transform = 'rotate(180deg)';
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
            var checkmark_id = connection.userid + connection.token();
            appendChatMessage(chatMessage);
            connection.send({
                chatMessage: chatMessage,
                checkmark_id: checkmark_id,
            });
        }
    };
    
}
