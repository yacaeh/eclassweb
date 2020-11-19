ReactDOM.render(<LanguageSelector />, document.getElementById('lang'));

var ver_time_table = false;

if (ver_time_table) {
    document.getElementById("login_form").parentElement.removeChild(document.getElementById("login_form"));
}
else {
    document.getElementById("time_table").parentElement.removeChild(document.getElementById("time_table"));
    document.getElementById("user-name").parentElement.removeChild(document.getElementById("user-name"));
}

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

$('#btn-join-hidden-room').click(function () {
    var roomid = $('#txt-roomid').val().toString();
    if (!roomid || !roomid.replace(/ /g, '').length) {
        alertBox(window.langlist.ROOM_NUMBER_ERROR, window.langlist.ERROR);
        return;
    }

    var fullName = $('#txt-user-name').val().toString();
    if (!fullName || !fullName.replace(/ /g, '').length) {
        alertBox(window.langlist.NO_NAME_ERROR, window.langlist.ERROR);
        return;
    }

    connection.extra.userFullName = fullName;

    var roomPassword = $('#txt-room-password').val().toString();
    if (!roomPassword || !roomPassword.replace(/ /g, '').length) {
        alertBox(window.langlist.ROOM_PASSWORD_ERROR, window.langlist.ERROR);
        return;
    }
    connection.password = roomPassword;

    connection.socket.emit('is-valid-password', connection.password, roomid, function (isValidPassword, roomid, error) {
        if (isValidPassword === true) {
            joinAHiddenRoom(roomid);
        }
        else {
            alertBox(window.langlist.ROOM_INFO_ERROR, window.langlist.ERROR);
        }
    });
    return;
});

function checkCamAndMicExist() {
    connection.DetectRTC.load(function () {

        if (!connection.DetectRTC.hasMicrophone) {
            connection.mediaConstraints.audio = false;
            connection.session.audio = false;
            console.log("user has no mic!");
            alert(window.langlist.NO_MIC_ERROR);
        }

        if (!connection.DetectRTC.hasWebcam) {
            connection.mediaConstraints.video = false;
            connection.session.video = false;
            console.log("user has no cam!");
            alert(window.langlist.NO_CAM_ERROR);
        }

    });
}

function looper() {
    if (ver_time_table)
        connection.socket.emit('get-public-rooms', publicRoomIdentifier, function (listOfRooms) {
            ActiveClass(listOfRooms);
            setTimeout(looper, 1000);
        });
}


$('#btn-open-create-room-modal').click(function (e) {
    checkCamAndMicExist();
});

$('#btn-show-join-hidden-room').click(function (e) {
    checkCamAndMicExist();
    e.preventDefault();
    $('#txt-room-password-hidden').parent().hide();
    $('#joinRoomModel').modal('show');
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
        callback();
    });

    $('#alert-title').html(title || 'Alert');
    $('#alert-special').html(specialMessage || '');
    $('#alert-message').html(message);
    $('#alert-box').modal({
        backdrop: 'static',
        keyboard: false
    });
}

function confirmBox(message, callback) {
    $('#btn-confirm-action').html('Confirm').unbind('click').bind('click', function (e) {
        e.preventDefault();
        $('#confirm-box').modal('hide');
        callback(true);
    });

    $('#btn-confirm-close').html('Cancel');

    $('.btn-confirm-close').unbind('click').bind('click', function (e) {
        e.preventDefault();
        $('#confirm-box').modal('hide');
        callback(false);
    });

    $('#confirm-message').html(message);
    $('#confirm-title').html('Please Confirm');
    $('#confirm-box').modal({
        backdrop: 'static',
        keyboard: false
    });
}

$('#btn-create-room').click(function () {
    var roomid = $('#txt-roomid').val().toString();
    if (!roomid || !roomid.replace(/ /g, '').length) {
        alertBox(window.langlist.ROOM_NUMBER_ERROR, window.langlist.ERROR);
        return;
    }

    var fullName = $('#txt-user-name').val().toString();
    if (!fullName || !fullName.replace(/ /g, '').length) {
        alertBox(window.langlist.NO_NAME_ERROR, window.langlist.ERROR);
        return;
    }

    connection.extra.userFullName = fullName;

    var roomPassword = $('#txt-room-password').val().toString();
    if (!roomPassword || !roomPassword.replace(/ /g, '').length) {
        alertBox(window.langlist.ROOM_PASSWORD_ERROR, window.langlist.ERROR);
        return;
    }

    connection.password = roomPassword;

    var initialHTML = $('#btn-create-room').html();

    $('#btn-create-room').html('Please wait...').prop('disabled', true);

    connection.checkPresence(roomid, function (isRoomExist, a, extra) {
        console.log(isRoomExist, a, extra);

        connection.DetectRTC.load(function () {
            if (!connection.DetectRTC.hasMicrophone) {
                console.log("user has no mic!");
                alertBox(window.langlist.NO_MIC_ERROR, window.langlist.ERROR);
                $('#btn-create-room').html(initialHTML).prop('disabled', false);
                return;
            }

            if (isRoomExist === true && !extra._room.teacher_rejoin) {
                alertBox(window.langlist.EXISTING_ROOM_ERROR, window.langlist.ERROR);
                $('#btn-create-room').html(initialHTML).prop('disabled', false);
                return;
            }

            if (extra._room.teacher_rejoin) {
                connection.teacher_rejoin = true;
            }

            // connection.publicRoomIdentifier = '';
            connection.sessionid = roomid;
            connection.isInitiator = true;
            connection.session.oneway = true;
            openCanvasDesigner();

            $('#btn-create-room').html(initialHTML).prop('disabled', false);
        });


    });
});

$('#chk-room-password').change(function () {
    $('#txt-room-password').parent().css('display', this.checked === true ? 'block' : 'none');
    $('#txt-room-password').focus();
});

if (ver_time_table)
    MakeTimeTable("time_table", 7, 5);
