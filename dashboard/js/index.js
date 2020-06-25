// this object is used to get uniquie rooms based on this demo
// i.e. only those rooms that are created on this page
var publicRoomIdentifier = 'dashboard';
var connection = new RTCMultiConnection();

connection.socketURL = '/';
// connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

/// make this room public
connection.publicRoomIdentifier = publicRoomIdentifier;
connection.socketMessageEvent = publicRoomIdentifier;

// keep room opened even if owner leaves
connection.autoCloseEntireSession = false;

connection.connectSocket(function (socket) {
    looper();

    socket.on('disconnect', function () {
        location.reload();
    });
});
console.log(connection);
connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: false,
    OfferToReceiveVideo: false
};

function checkCamAndMicExist(){
    connection.DetectRTC.load(function() {
        if (!connection.DetectRTC.hasMicrophone) {
            connection.mediaConstraints.audio = false;
            connection.session.audio = false;
            console.log("user has no mic!");
            alert("마이크가 없습니다!");
        }
    
        if (!connection.DetectRTC.hasWebcam) {
            connection.mediaConstraints.video = false;
            connection.session.video = false;
            console.log("user has no cam!");
            alert("캠이 없습니다!");
        }
    });
}

// connection.join({
//     sessionid: connection.channel,
//     userid: connection.channel,
//     extra: {},
//     session: connection.session
// });


function looper() {
    if (!$('#rooms-list').length) return;
    connection.socket.emit('get-public-rooms', publicRoomIdentifier, function (listOfRooms) {
        updateListOfRooms(listOfRooms);

        setTimeout(looper, 3000);
    });
}

function updateListOfRooms(rooms) {
    $('#active-rooms').html(rooms.length);

    $('#rooms-list').html('');

    if (!rooms.length) {
        $('#rooms-list').html('<tr><td colspan=9>No active room found for this demo.</td></tr>');
        return;
    }

    rooms.forEach(function (room, idx) {
        var tr = document.createElement('tr');
        var html = '';
        if (!room.isPasswordProtected) {
            html += '<td>' + (idx + 1) + '</td>';
        }
        else {
            html += '<td>' + (idx + 1) + ' <img src="https://www.webrtc-experiment.com/images/password-protected.png" style="height: 15px; vertical-align: middle;" title="Password Protected Room"></td>';
        }

        html += '<td><span class="max-width" title="' + room.sessionid + '">' + room.sessionid + '</span></td>';
        html += '<td><span class="max-width" title="' + room.owner + '">' + room.owner + '</span></td>';

        html += '<td>';
        Object.keys(room.session || {}).forEach(function (key) {
            html += '<pre><b>' + key + ':</b> ' + room.session[key] + '</pre>';
        });
        html += '</td>';

        html += '<td><span class="max-width" title="' + JSON.stringify(room.extra || {}).replace(/"/g, '`') + '">' + JSON.stringify(room.extra || {}) + '</span></td>';

        html += '<td>';
        room.participants.forEach(function (pid) {
            html += '<span class="userinfo"><span class="max-width" title="' + pid + '">' + pid + '</span></span><br>';
        });
        html += '</td>';

        // check if room is full
        if (room.isRoomFull) {
            // room.participants.length >= room.maxParticipantsAllowed
            html += '<td><span style="border-bottom: 1px dotted red; color: red;">Room is full</span></td>';
        }
        else {
            html += '<td><button class="btn join-room" data-roomid="' + room.sessionid + '" data-password-protected="' + (room.isPasswordProtected === true ? 'true' : 'false') + '">Join</button></td>';
        }

        $(tr).html(html);
        $('#rooms-list').append(tr);

        $(tr).find('.join-room').click(function () {
            $(tr).find('.join-room').prop('disabled', true);

            var roomid = $(this).attr('data-roomid');
            $('#txt-roomid-hidden').val(roomid);

            $('#btn-show-join-hidden-room').click();

            if ($(this).attr('data-password-protected') === 'true') {
                $('#txt-room-password-hidden').parent().show();
            }
            else {
                $('#txt-room-password-hidden').parent().hide();
            }

            $(tr).find('.join-room').prop('disabled', false);
        });
    });
}
$('#btn-open-create-room-modal').click(function(e) {
    checkCamAndMicExist();
});

$('#btn-show-join-hidden-room').click(function(e) {
  checkCamAndMicExist();
  e.preventDefault();
  $('#txt-room-password-hidden').parent().hide();
  $('#joinRoomModel').modal('show');
});

$('#btn-join-hidden-room').click(function () {
    var roomid = $('#txt-roomid').val().toString();
    if (!roomid || !roomid.replace(/ /g, '').length) {
        alertBox('방 번호를 입력해주세요.', '에러');
        return;
    }

    var fullName = $('#txt-user-name').val().toString();
    if (!fullName || !fullName.replace(/ /g, '').length) {
        alertBox('이름을 입력해주세요.', '에러');
        return;
    }

    connection.extra.userFullName = fullName;

    var roomPassword = $('#txt-room-password').val().toString();
    if (!roomPassword || !roomPassword.replace(/ /g, '').length) {
        alertBox('방 비밀번호를 입력해주세요.', '에러');
        return;
    }
    connection.password = roomPassword;

    connection.socket.emit('is-valid-password', connection.password, roomid, function (isValidPassword, roomid, error) {
        if (isValidPassword === true) {
            joinAHiddenRoom(roomid);
        }
        else {
            alertBox('방 정보를 확인해주세요.', '에러');
        }
    });
    return;
});

function joinAHiddenRoom(roomid) {
    var initialHTML = $('#btn-join-hidden-room').html();

    $('#btn-join-hidden-room').html('Please wait...').prop('disabled', true);

    connection.checkPresence(roomid, function (isRoomExist) {
        if (isRoomExist === false) {
            alertBox('No such room exist on this server. Room-id: ' + roomid, 'Room Not Found');
            $('#btn-join-hidden-room').html(initialHTML).prop('disabled', false);
            return;
        }

        connection.sessionid = roomid;
        connection.isInitiator = false;
        connection.session.oneway = true;
        $('#joinRoomModel').modal('hide');
        openCanvasDesigner();

        $('#btn-join-hidden-room').html(initialHTML).prop('disabled', false);
    })
}

function openCanvasDesigner() {
    
    $('#startRoomModel').modal('hide');
    var href = location.href + 'classroom.html?open=' + connection.isInitiator + '&sessionid=' + connection.sessionid + '&publicRoomIdentifier=' + connection.publicRoomIdentifier + '&userFullName=' + connection.extra.userFullName;

    if (!!connection.password) {
        href += '&password=' + connection.password;
    }

    var newWin = window.open(href, "_self");
    if (!newWin || newWin.closed || typeof newWin.closed == 'undefined') {
        var html = '';
        html += '<p>Please click following link:</p>';
        html += '<p><a href="' + href + '" target="_blank">';
        if (connection.isInitiator) {
            html += 'Click To Open The Room';
        }
        else {
            html += 'Click To Join The Room';
        }
        html += '</a></p>';
        alertBox(html, 'Popups Are Blocked');
    }
}

function alertBox(message, title, specialMessage, callback) {
    callback = callback || function () { };

    $('.btn-alert-close').unbind('click').bind('click', function (e) {
        e.preventDefault();
        $('#alert-box').modal('hide');
        $('#confirm-box-topper').hide();

        callback();
    });

    $('#alert-title').html(title || 'Alert');
    $('#alert-special').html(specialMessage || '');
    $('#alert-message').html(message);
    $('#confirm-box-topper').show();

    $('#alert-box').modal({
        backdrop: 'static',
        keyboard: false
    });
}

function confirmBox(message, callback) {
    $('#btn-confirm-action').html('Confirm').unbind('click').bind('click', function (e) {
        e.preventDefault();
        $('#confirm-box').modal('hide');
        $('#confirm-box-topper').hide();
        callback(true);
    });

    $('#btn-confirm-close').html('Cancel');

    $('.btn-confirm-close').unbind('click').bind('click', function (e) {
        e.preventDefault();
        $('#confirm-box').modal('hide');
        $('#confirm-box-topper').hide();
        callback(false);
    });

    $('#confirm-message').html(message);
    $('#confirm-title').html('Please Confirm');
    $('#confirm-box-topper').show();

    $('#confirm-box').modal({
        backdrop: 'static',
        keyboard: false
    });
}

$('#btn-create-room').click(function () {
    var roomid = $('#txt-roomid').val().toString();
    if (!roomid || !roomid.replace(/ /g, '').length) {
        alertBox('방 번호를 입력해주세요.', '에러');
        return;
    }

    var fullName = $('#txt-user-name').val().toString();
    if (!fullName || !fullName.replace(/ /g, '').length) {
        alertBox('이름을 입력해주세요.', '에러');
        return;
    }

    connection.extra.userFullName = fullName;

    var roomPassword = $('#txt-room-password').val().toString();
    if (!roomPassword || !roomPassword.replace(/ /g, '').length) {
        alertBox('방 비밀번호를 입력해주세요.', '에러');
        return;
    }

    connection.password = roomPassword;

    var initialHTML = $('#btn-create-room').html();

    $('#btn-create-room').html('Please wait...').prop('disabled', true);

    connection.checkPresence(roomid, function (isRoomExist) {
        if (isRoomExist === true) {
            alertBox('이미 존재하는 방입니다.', '에러');
            return;
        }

        if ($('#chk-hidden-room').prop('checked') === true) {
            // either make it unique!
            // connection.publicRoomIdentifier = connection.token() + connection.token();

            // or set an empty value (recommended)
            connection.publicRoomIdentifier = '';
        }

        connection.sessionid = roomid;
        connection.isInitiator = true;
        connection.session.oneway = true;
        openCanvasDesigner();
        $('#btn-create-room').html(initialHTML).prop('disabled', false);
    });
});

$('#chk-room-password').change(function () {
    $('#txt-room-password').parent().css('display', this.checked === true ? 'block' : 'none');
    $('#txt-room-password').focus();
});

var txtRoomId = document.getElementById('txt-roomid');

txtRoomId.onkeyup = txtRoomId.onblur = txtRoomId.oninput = txtRoomId.onpaste = function () {
    localStorage.setItem('canvas-designer-roomid', txtRoomId.value);
};

if (localStorage.getItem('canvas-designer-roomid')) {
    txtRoomId.value = localStorage.getItem('canvas-designer-roomid');
    $('#txt-roomid-hidden').val(txtRoomId.value);
}

var userFullName = document.getElementById('txt-user-name');

userFullName.onkeyup = userFullName.onblur = userFullName.oninput = userFullName.onpaste = function () {
    localStorage.setItem('canvas-designer-user-full-name', userFullName.value);
};

if (localStorage.getItem('canvas-designer-user-full-name')) {
    userFullName.value = localStorage.getItem('canvas-designer-user-full-name');
    $('#txt-user-name-hidden').val(userFullName.value);
}