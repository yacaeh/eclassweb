// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/RTCMultiConnection

var listOfUsers = {};
var listOfRooms = {};
let teacherlist = {};

var adminSocket;

// for scalable-broadcast demos
var ScalableBroadcast;

// pushLogs is used to write error logs into logs.json
const fs = require("fs")
const db = require('./db');

var pushLogs = require('rtcmulticonnection-server/node_scripts/pushLogs.js');
// const strings
var CONST_STRINGS = require('rtcmulticonnection-server/node_scripts/CONST_STRINGS.js');

var isAdminAuthorized = require('rtcmulticonnection-server/node_scripts/verify-admin.js');

module.exports = exports = function (socket, config) {
    config = config || {};

    socket.server.engine.pingTimeout = 50000000
    onConnection(socket);

    // to secure your socket.io usage: (via: docs/tips-tricks.md)
    // io.set('origins', 'https://domain.com');

    function alertbox(...params){                 
        let top = "┌";
        let mid = "│  ";
        let bot = "└";   
        
        let length = 0;
        length += params.length + 2;
        params.forEach((e) => {
            mid += String(e) + " ";
            length += String(e).length;
        })

        for(let i = 0 ; i < length; i++){
            top += '─';
            bot += '─';
        }

        top += '┐';
        mid += '│';
        bot += '┘';

        console.log(top);
        console.log(mid);
        console.log(bot);
    }

    function appendUser(socket, params) {
        try {
            var extra = params.extra;
            var params = socket.handshake.query;

            if (params.extra) {
                try {
                    if (typeof params.extra === 'string') {
                        params.extra = JSON.parse(params.extra);
                    }
                    extra = params.extra;
                } catch (e) {
                    extra = params.extra;
                }
            }

            listOfUsers[socket.userid] = {
                socket: socket,
                connectedWith: {},
                extra: extra || {},
                admininfo: {},
                socketMessageEvent: params.socketMessageEvent || '',
                socketCustomEvent: params.socketCustomEvent || ''
            };
        } catch (e) {
            pushLogs(config, 'appendUser', e);
        }

        sendToAdmin();
    }

    function sendToAdmin(all) {
        if (config.enableAdmin !== true) {
            return;
        }

        try {
            if (adminSocket) {
                var users = [];
                // temporarily disabled
                config.enableAdmin === true && Object.keys(listOfUsers).forEach(function (userid) {
                    try {
                        var item = listOfUsers[userid];
                        if (!item) return; // maybe user just left?

                        if (!item.connectedWith) {
                            item.connectedWith = {};
                        }

                        if (!item.socket) {
                            item.socket = {};
                        }

                        users.push({
                            userid: userid,
                            admininfo: item.socket.admininfo || '',
                            connectedWith: Object.keys(item.connectedWith)
                        });
                    } catch (e) {
                        pushLogs(config, 'admin.user-looper', e);
                    }
                });

                var scalableBroadcastUsers = 0;
                if (ScalableBroadcast && ScalableBroadcast._) {
                    scalableBroadcastUsers = ScalableBroadcast._.getUsers();
                }

                adminSocket.emit('admin', {
                    newUpdates: !all,
                    listOfRooms: !!all ? listOfRooms : [],
                    listOfUsers: Object.keys(listOfUsers).length, // users
                    scalableBroadcastUsers: scalableBroadcastUsers.length
                });
            }
        } catch (e) {
            pushLogs(config, 'admin', e);
        }
    }

    function handleAdminSocket(socket, params) {
        if (config.enableAdmin !== true || !params.adminUserName || !params.adminPassword) {
            socket.emit('admin', {
                error: 'Please pass "adminUserName" and "adminPassword" via socket.io parameters.'
            });

            pushLogs(config, 'invalid-admin', {
                message: CONST_STRINGS.INVALID_ADMIN_CREDENTIAL,
                stack: 'name: ' + params.adminUserName + '\n' + 'password: ' + params.adminPassword
            });

            socket.disconnect(); //disabled admin
            return;
        }

        if (!isAdminAuthorized(params, config)) {
            socket.emit('admin', {
                error: 'Invalid admin username or password.'
            });

            pushLogs(config, 'invalid-admin', {
                message: CONST_STRINGS.INVALID_ADMIN_CREDENTIAL,
                stack: 'name: ' + params.adminUserName + '\n' + 'password: ' + params.adminPassword
            });

            socket.disconnect();
            return;
        }

        socket.emit('admin', {
            connected: true
        });

        adminSocket = socket;

        socket.on('get-log-list', function (e) {
            let filelist = fs.readdirSync('./logs')
            filelist = filelist.reverse();
            e(filelist);
        })

        socket.on('delete-log-file', function (name, callback) {
            fs.unlinkSync('./logs/' + name);
            callback(200);
        })

        socket.on('admin', function (message, callback) {
            if (!isAdminAuthorized(params, config)) {
                socket.emit('admin', {
                    error: 'Invalid admin username or password.'
                });

                pushLogs(config, 'invalid-admin', {
                    message: CONST_STRINGS.INVALID_ADMIN_CREDENTIAL,
                    stack: 'name: ' + params.adminUserName + '\n' + 'password: ' + params.adminPassword
                });

                socket.disconnect();
                return;
            }

            callback = callback || function () { };

            if (message.all === true) {
                sendToAdmin(true);
            }

            if (message.userinfo === true && message.userid) {
                try {
                    var user = listOfUsers[message.userid];
                    if (user) {
                        callback(user.socket.admininfo || {});
                    } else {
                        callback({
                            error: CONST_STRINGS.USERID_NOT_AVAILABLE
                        });
                    }
                } catch (e) {
                    pushLogs(config, 'userinfo', e);
                }
            }

            if (message.clearLogs === true) {
                pushLogs(config, '', '', callback);
            }

            if (message.deleteUser === true) {
                try {
                    var user = listOfUsers[message.userid];

                    if (user) {
                        user.socket.disconnect();
                    }

                    callback(true);
                } catch (e) {
                    pushLogs(config, 'deleteUser', e);
                    callback(false);
                }
            }

            if (message.deleteRoom === true) {
                try {
                    var room = listOfRooms[message.roomid];

                    if (room) {
                        var participants = room.participants;
                        delete listOfRooms[message.roomid];
                        participants.forEach(function (userid) {
                            var user = listOfUsers[userid];
                            if (user) {
                                user.socket.disconnect();
                            }
                        });
                    }
                    callback(true);
                } catch (e) {
                    pushLogs(config, 'deleteRoom', e);
                    callback(false);
                }
            }
        });
    }

    function onConnection(socket) {
        var params = socket.handshake.query;
        console.log("connected",params.userid);
        if (!params.userid) {
            params.userid = (Math.random() * 100).toString().replace('.', '');
        }

        if (!params.sessionid) {
            params.sessionid = (Math.random() * 100).toString().replace('.', '');
        }

        if (params.extra) {
            try {
                params.extra = JSON.parse(params.extra);
            } catch (e) {
                params.extra = {};
            }
        } else {
            params.extra = {};
        }

        var socketMessageEvent = params.msgEvent || 'RTCMultiConnection-Message';

        // for admin's record
        params.socketMessageEvent = socketMessageEvent;
        var enableScalableBroadcast = params.enableScalableBroadcast === true || params.enableScalableBroadcast === 'true';
        if (params.userid === 'admin') {
            handleAdminSocket(socket, params);
            return;
        }

        if (enableScalableBroadcast === true) {
            try {
                if (!ScalableBroadcast) {
                    ScalableBroadcast = require('rtcmulticonnection-server/node_scripts/Scalable-Broadcast.js');
                }
                ScalableBroadcast._ = ScalableBroadcast(config, socket, params.maxRelayLimitPerUser);
            } catch (e) {
                pushLogs(config, 'ScalableBroadcast', e);
            }
        }

        // do not allow to override userid
        if (!!listOfUsers[params.userid]) {
            console.log("Alreay user id");
            var useridAlreadyTaken = params.userid;
            params.userid = (Math.random() * 1000).toString().replace('.', '');
            socket.emit('userid-already-taken', useridAlreadyTaken, params.userid);
            return;
        }

        socket.userid = params.userid;
        appendUser(socket, params);

        socket.on('extra-data-updated', function (extra) {
            try {
                if (!listOfUsers[socket.userid]) return;

                if (listOfUsers[socket.userid].socket.admininfo) {
                    listOfUsers[socket.userid].socket.admininfo.extra = extra;
                }

                // todo: use "admininfo.extra" instead of below one
                listOfUsers[socket.userid].extra = extra;

                try {
                    for (var user in listOfUsers[socket.userid].connectedWith) {
                        try {
                            listOfUsers[user].socket.emit('extra-data-updated', socket.userid, extra);
                        } catch (e) {
                            pushLogs(config, 'extra-data-updated.connectedWith', e);
                        }
                    }
                } catch (e) {
                    pushLogs(config, 'extra-data-updated.connectedWith', e);
                }

                // sent alert to all room participants
                if (!socket.admininfo) {
                    sendToAdmin();
                    return;
                }

                var roomid = socket.admininfo.sessionid;
                if (roomid && listOfRooms[roomid]) {
                    if (socket.userid == listOfRooms[roomid].owner) {
                        // room's extra must match owner's extra
                        listOfRooms[roomid].extra = extra;
                    }
                    listOfRooms[roomid].participants.forEach(function (pid) {
                        try {
                            var user = listOfUsers[pid];
                            if (!user) {
                                // todo: remove this user from participants list
                                return;
                            }

                            user.socket.emit('extra-data-updated', socket.userid, extra);
                        } catch (e) {
                            pushLogs(config, 'extra-data-updated.participants', e);
                        }
                    });
                }

                sendToAdmin();
            } catch (e) {
                pushLogs(config, 'extra-data-updated', e);
            }
        });

        socket.on('get-remote-user-extra-data', function (remoteUserId, callback) {
            callback = callback || function () { };
            if (!remoteUserId || !listOfUsers[remoteUserId]) {
                callback(CONST_STRINGS.USERID_NOT_AVAILABLE);
                return;
            }
            callback(listOfUsers[remoteUserId].extra);
        });

        var dontDuplicateListeners = {};
        socket.on('set-custom-socket-event-listener', function (customEvent) {
            if (dontDuplicateListeners[customEvent]) return;
            dontDuplicateListeners[customEvent] = customEvent;

            socket.on(customEvent, function (message) {
                console.log(message);
                try {
                    socket.broadcast.emit(customEvent, message);
                } catch (e) { 
                }
            });
        });

        socket.on('set-password', function (password, callback) {
            try {
                callback = callback || function () { };

                if (!socket.admininfo) {
                    callback(null, null, CONST_STRINGS.DID_NOT_JOIN_ANY_ROOM);
                    return;
                }

                var roomid = socket.admininfo.sessionid;

                if (listOfRooms[roomid] && listOfRooms[roomid].owner == socket.userid) {
                    listOfRooms[roomid].password = password;
                    callback(true, roomid, null);
                }
                else {
                    callback(false, roomid, CONST_STRINGS.ROOM_PERMISSION_DENIED);
                }
            } catch (e) {
                pushLogs(config, 'set-password', e);
            }
        });

        socket.on('disconnect-with', function (remoteUserId, callback) {
            try {
                if (listOfUsers[socket.userid] && listOfUsers[socket.userid].connectedWith[remoteUserId]) {
                    delete listOfUsers[socket.userid].connectedWith[remoteUserId];
                    socket.emit('user-disconnected', remoteUserId);
                    sendToAdmin();
                }

                if (!listOfUsers[remoteUserId]) return callback();

                if (listOfUsers[remoteUserId].connectedWith[socket.userid]) {
                    delete listOfUsers[remoteUserId].connectedWith[socket.userid];
                    listOfUsers[remoteUserId].socket.emit('user-disconnected', socket.userid);
                    sendToAdmin();
                }
                callback();
            } catch (e) {
                pushLogs(config, 'disconnect-with', e);
            }
        });

        socket.on('close-entire-session', function (callback) {
            try {
                if (!callback || typeof callback !== 'function') {
                    callback = function () { };
                }

                var user = listOfUsers[socket.userid];

                if (!user) return callback(false, CONST_STRINGS.USERID_NOT_AVAILABLE);
                if (!user.roomid) return callback(false, CONST_STRINGS.ROOM_NOT_AVAILABLE);
                if (!socket.admininfo) return callback(false, CONST_STRINGS.INVALID_SOCKET);

                var room = listOfRooms[user.roomid];
                if (!room) return callback(false, CONST_STRINGS.ROOM_NOT_AVAILABLE);
                if (room.owner !== user.userid) return callback(false, CONST_STRINGS.ROOM_PERMISSION_DENIED);

                autoCloseEntireSession = true;
                closeOrShiftRoom();

                callback(true);
            } catch (e) {
                pushLogs(config, 'close-entire-session', e);
            }
        });

        socket.on('check-presence', function (roomid, callback) {
            console.log('check-presence')
            try {
                if (!listOfRooms[roomid]) {
                    callback(false, roomid, {
                        _room: {
                            isFull: false,
                            isPasswordProtected: false
                        }
                    });
                }
                else {
                    console.log("Room already exist")
                    var extra = listOfRooms[roomid].extra;
                    if (typeof extra !== 'object' || !extra) {
                        extra = {
                            value: extra
                        };
                    }
                    extra._room = {
                        isFull: listOfRooms[roomid].participants.length >= listOfRooms[roomid].maxParticipantsAllowed,
                        isPasswordProtected: listOfRooms[roomid].password && listOfRooms[roomid].password.toString().replace(/ /g, '').length
                    };

                    if (listOfRooms[roomid].participants.indexOf(listOfRooms[roomid].owner) == -1) {
                        console.log("But owner isn't joined")
                        extra._room.teacher_rejoin = true
                    }

                    callback(true, roomid, extra);
                }
            } catch (e) {
                pushLogs(config, 'check-presence', e);
            }
        });

        socket.on('owner-change', function (roomid, ownerid, callback) {
            console.log("Owner change :", listOfRooms[roomid].owner + " => " + ownerid)
            listOfRooms[roomid].owner = ownerid;
        })

        function onMessageCallback(message) {
            try {
                // todo: remove all these redundant codes
                // fire "onUserStatusChanged" for room-participants instead of individual users
                if (!message.message.userLeft && !listOfUsers[message.sender].connectedWith[message.remoteUserId] && !!listOfUsers[message.remoteUserId]) {
                    listOfUsers[message.sender].connectedWith[message.remoteUserId] = listOfUsers[message.remoteUserId].socket;

                    if (!listOfUsers[message.remoteUserId]) {
                        listOfUsers[message.remoteUserId] = {
                            socket: null,
                            connectedWith: {},
                            extra: {},
                            admininfo: {}
                        };
                    }

                    listOfUsers[message.remoteUserId].connectedWith[message.sender] = socket;
                    sendToAdmin();
                }

                if (listOfUsers[message.sender] && listOfUsers[message.sender].connectedWith[message.remoteUserId] && listOfUsers[socket.userid]) {
                    message.extra = listOfUsers[socket.userid].extra;
                    listOfUsers[message.sender].connectedWith[message.remoteUserId].emit(socketMessageEvent, message);

                    sendToAdmin();
                }
            } catch (e) {
                pushLogs(config, 'onMessageCallback', e);
            }
        }

        function joinARoom(message) {
            try {
                if (!socket.admininfo || !socket.admininfo.sessionid) return;

                // var roomid = message.remoteUserId;
                var roomid = socket.admininfo.sessionid;

                if (!listOfRooms[roomid]) return; // find a solution?

                if (listOfRooms[roomid].participants.length >= listOfRooms[roomid].maxParticipantsAllowed && listOfRooms[roomid].participants.indexOf(socket.userid) === -1) {
                    return;
                }

                if (listOfRooms[roomid].session && (listOfRooms[roomid].session.oneway === true || listOfRooms[roomid].session.broadcast === true)) {
                    var owner = listOfRooms[roomid].owner;
                    if (listOfUsers[owner]) {
                        message.remoteUserId = owner;

                        if (enableScalableBroadcast === false) {
                            // only send to owner i.e. only connect with room owner
                            listOfUsers[owner].socket.emit(socketMessageEvent, message);
                        }
                    }
                    return;
                }

                if (enableScalableBroadcast === false) {
                    // connect with all participants
                    listOfRooms[roomid].participants.forEach(function (pid) {
                        if (pid === socket.userid || !listOfUsers[pid]) return;

                        var user = listOfUsers[pid];
                        message.remoteUserId = pid;
                        user.socket.emit(socketMessageEvent, message);
                    });
                }
            } catch (e) {
                pushLogs(config, 'joinARoom',    e);
            }

            sendToAdmin();
        }

        function appendToRoom(roomid, userid, maintainRoom) {
            try {
                if (!listOfRooms[roomid]) {
                    listOfRooms[roomid] = {
                        maxParticipantsAllowed: parseInt(params.maxParticipantsAllowed || 1000) || 1000,
                        realowner: userid,
                        owner: userid, // this can change if owner leaves and if control shifts
                        participants: [],
                        userlist : {},
                        maintainRoom : maintainRoom || false,
                        extra: {},
                        info: {
                            roomOpenTime: new Date().getTime(),    // 현재 시간 저장
                            allControl: false,
                            movierender: {
                                state: false,
                                url: undefined,
                            },
                            shareScreen: {
                                state: false,
                                id: undefined,
                            },
                            camshare:{
                                id: undefined
                            },
                            epub: {
                                state: false,
                                page: 0,
                                data: {
                                    src: undefined,
                                }
                            },
                            share3D: {
                                state: false,
                                data: {}
                            },
                            pdf: {
                                state: false
                            },
                            exam: false,
                            viewer: {
                                state: false,
                                url: undefined
                            },
                            classPermission: undefined,
                            micPermission: undefined,
                            canvasPermission: [],
                        },
                        socketMessageEvent: '',
                        socketCustomEvent: '',
                        identifier: '',
                        session: {
                            audio: true,
                            video: true
                        }
                    };


                    if(!maintainRoom){
                        listOfRooms[roomid].participants.push(userid);
                    }
                    listOfRooms[roomid].userlist[userid] = listOfUsers[socket.userid].extra.userFullName;

                    db.createRoom(listOfRooms[roomid], roomid);
                    alertbox("Appended room", roomid, userid);

                    return;
                }

                if (listOfRooms[roomid].participants.indexOf(userid) !== -1) {
                    return;
                }

                listOfRooms[roomid].userlist[userid] = listOfUsers[socket.userid].extra.userFullName;
                listOfRooms[roomid].participants.push(userid);
            } catch (e) {
                pushLogs(config, 'appendToRoom', e);
            }
        }

        function closeOrShiftRoom() {
            try {
                if (!socket.admininfo) {
                    return;
                }

                var roomid = socket.admininfo.sessionid;
                
                if(!listOfRooms[roomid] || listOfRooms[roomid].maintainRoom)
                    return;

                if (roomid && listOfRooms[roomid]) {

                    if (socket.userid === listOfRooms[roomid].owner) {

                        if (listOfRooms[roomid].participants.length > 1) {
                            var firstParticipant;

                            listOfRooms[roomid].participants.forEach(function (pid) {
                                if (firstParticipant || pid === socket.userid) return;
                                if (!listOfUsers[pid]) return;
                                firstParticipant = listOfUsers[pid];
                            });

                            if (firstParticipant) {
                                var newParticipantsList = [];
                                listOfRooms[roomid].participants.forEach(function (pid) {
                                    if (pid != socket.userid) {
                                        newParticipantsList.push(pid);
                                    }
                                });
                                listOfRooms[roomid].participants = newParticipantsList;
                            }
                            else {
                                console.log("DELETED 1")
                                delete listOfRooms[roomid];
                            }
                        }

                        else {
                            console.log("Deleted room : maybe owner isn't in room");
                            delete listOfRooms[roomid];
                        }
                    }

                    else {
                        var newParticipantsList = [];
                        listOfRooms[roomid].participants.forEach(function (pid) {
                            if (pid && pid != socket.userid && listOfUsers[pid]) {
                                newParticipantsList.push(pid);
                            }
                        });
                        listOfRooms[roomid].participants = newParticipantsList;
                    }

                }
            } catch (e) {
                pushLogs(config, 'closeOrShiftRoom', e);
            }
        }

        socket.on(socketMessageEvent, function (message, callback) {
            if (message.remoteUserId && message.remoteUserId === socket.userid) {
                return;
            }

            try {
                if (message.remoteUserId && message.remoteUserId != 'system' && message.message.newParticipationRequest) {
                    if (enableScalableBroadcast === true) {
                        var user = listOfUsers[message.remoteUserId];
                        if (user) {
                            user.socket.emit(socketMessageEvent, message);
                        }

                        if (listOfUsers[socket.userid] && listOfUsers[socket.userid].extra.broadcastId) {
                            // for /admin/ page
                            appendToRoom(listOfUsers[socket.userid].extra.broadcastId, socket.userid);
                        }
                    } else if (listOfRooms[message.remoteUserId]) {
                        joinARoom(message);
                        return;
                    }
                }

                // for v3 backward compatibility; >v3.3.3 no more uses below block
                if (message.remoteUserId == 'system') {
                    if (message.message.detectPresence) {
                        if (message.message.userid === socket.userid) {
                            callback(false, socket.userid);
                            return;
                        }

                        callback(!!listOfUsers[message.message.userid], message.message.userid);
                        return;
                    }
                }

                if (!listOfUsers[message.sender]) {
                    listOfUsers[message.sender] = {
                        socket: socket,
                        connectedWith: {},
                        extra: {},
                        admininfo: {}
                    };
                }

                // if someone tries to join a person who is absent

                onMessageCallback(message);
            } catch (e) {
                pushLogs(config, 'on-socketMessageEvent', e);
            }
        });

        socket.on('is-valid-password', function (password, roomid, callback) {
            try {
                callback = callback || function () { };

                if (!password || !password.toString().replace(/ /g, '').length) {
                    callback(false, roomid, 'You did not enter the password.');
                    return;
                }

                if (!roomid || !roomid.toString().replace(/ /g, '').length) {
                    callback(false, roomid, 'You did not enter the room-id.');
                    return;
                }

                if (!listOfRooms[roomid]) {
                    callback(false, roomid, CONST_STRINGS.ROOM_NOT_AVAILABLE);
                    return;
                }

                if (!listOfRooms[roomid].password) {
                    callback(false, roomid, 'This room do not have any password.');
                    return;
                }

                if (listOfRooms[roomid].password === password) {
                    callback(true, roomid, false);
                }
                else {
                    callback(false, roomid, CONST_STRINGS.INVALID_PASSWORD);
                }
            }
            catch (e) {
                pushLogs('is-valid-password', e);
            }
        });

        socket.on('get-public-rooms', function (identifier, callback) {
            try {
                if (!identifier || !identifier.toString().length || !identifier.toString().replace(/ /g, '').length) {
                    callback(null, CONST_STRINGS.PUBLIC_IDENTIFIER_MISSING);
                    return;
                }

                var rooms = [];
                Object.keys(listOfRooms).forEach(function (key) {
                    var room = listOfRooms[key];
                    if (!room || !room.identifier || !room.identifier.toString().length || room.identifier !== identifier) return;
                    rooms.push({
                        maxParticipantsAllowed: room.maxParticipantsAllowed,
                        owner: room.owner,
                        participants: room.participants,
                        extra: room.extra,
                        session: room.session,
                        sessionid: key,
                        isRoomFull: room.participants.length >= room.maxParticipantsAllowed,
                        isPasswordProtected: !!room.password && room.password.replace(/ /g, '').length > 0
                    });
                });

                callback(rooms);
            }
            catch (e) {
                pushLogs('get-public-rooms', e);
            }
        });

        socket.on('open-room', function (arg, callback) {
            callback = callback || function () { };
            try {
                // if already joined a room, either leave or close it
                if (listOfRooms[arg.sessionid] &&
                    listOfRooms[arg.sessionid].participants.indexOf(listOfRooms[arg.sessionid].owner) == -1) {
                    console.log("owner rejoin");
                    listOfRooms[arg.sessionid].owner = socket.userid;
                    callback(false, "owner rejoin", listOfRooms[arg.sessionid].info);
                    return;
                }

                closeOrShiftRoom();

                if (listOfRooms[arg.sessionid] && listOfRooms[arg.sessionid].participants.length) {
                    callback(false, "room already exist");
                    return;
                }

                if (enableScalableBroadcast === true) {
                    arg.session.scalable = true;
                    arg.sessionid = arg.extra.broadcastId;
                }

                // maybe redundant?
                if (!listOfUsers[socket.userid]) {
                    listOfUsers[socket.userid] = {
                        socket: socket,
                        connectedWith: {},
                        extra: arg.extra,
                        admininfo: {},
                        socketMessageEvent: params.socketMessageEvent || '',
                        socketCustomEvent: params.socketCustomEvent || ''
                    };
                }
                listOfUsers[socket.userid].extra = arg.extra;

                if (arg.session && (arg.session.oneway === true || arg.session.broadcast === true)) {
                    autoCloseEntireSession = true;
                }
            } catch (e) {
                pushLogs(config, 'open-room', e);
            }

            // append this user into participants list
            appendToRoom(arg.sessionid, socket.userid);

            try {
                // override owner & session
                if (enableScalableBroadcast === true) {
                    if (Object.keys(listOfRooms[arg.sessionid]).length == 1) {
                        listOfRooms[arg.sessionid].owner = socket.userid;
                        listOfRooms[arg.sessionid].session = arg.session;
                    }
                } else {
                    // for non-scalable-broadcast demos
                    listOfRooms[arg.sessionid].owner = socket.userid;
                    listOfRooms[arg.sessionid].session = arg.session;
                    listOfRooms[arg.sessionid].extra = arg.extra || {};
                    listOfRooms[arg.sessionid].socketMessageEvent = listOfUsers[socket.userid].socketMessageEvent;
                    listOfRooms[arg.sessionid].socketCustomEvent = listOfUsers[socket.userid].socketCustomEvent;
                    listOfRooms[arg.sessionid].maxParticipantsAllowed = parseInt(params.maxParticipantsAllowed || 1000) || 1000;

                    if (arg.identifier && arg.identifier.toString().length) {
                        listOfRooms[arg.sessionid].identifier = arg.identifier;
                    }

                    try {
                        if (typeof arg.password !== 'undefined' && arg.password.toString().length) {
                            // password protected room?
                            listOfRooms[arg.sessionid].password = arg.password;
                        }
                    } catch (e) {
                        pushLogs(config, 'open-room.password', e);
                    }
                }

                // admin info are shared only with /admin/
                listOfUsers[socket.userid].socket.admininfo = {
                    sessionid: arg.sessionid,
                    session: arg.session,
                    mediaConstraints: arg.mediaConstraints,
                    sdpConstraints: arg.sdpConstraints,
                    streams: arg.streams,
                    extra: arg.extra
                };
            } catch (e) {
                pushLogs(config, 'open-room', e);
            }

            sendToAdmin();

            try {
                callback(true, '_', listOfRooms[arg.sessionid].info);
            } catch (e) {
                pushLogs(config, 'open-room', e);
            }

            OpenRoom();
        });

        socket.on('join-room', function (arg, callback) {
            callback = callback || function () { };

            try {
                closeOrShiftRoom();

                if (enableScalableBroadcast === true) {
                    arg.session.scalable = true;
                    arg.sessionid = arg.extra.broadcastId;
                }

                // maybe redundant?
                if (!listOfUsers[socket.userid]) {
                    listOfUsers[socket.userid] = {
                        socket: socket,
                        connectedWith: {},
                        extra: arg.extra,
                        admininfo: {},
                        socketMessageEvent: params.socketMessageEvent || '',
                        socketCustomEvent: params.socketCustomEvent || ''
                    };
                }
                listOfUsers[socket.userid].extra = arg.extra;
            } catch (e) {
                pushLogs(config, 'join-room', e);
            }

            try {
                if (!listOfRooms[arg.sessionid]) {
                    console.log("There is Not room")
                    callback(false, CONST_STRINGS.ROOM_NOT_AVAILABLE);
                    return;
                }
            } catch (e) {
                pushLogs(config, 'join-room', e);
            }

            try {
                if (listOfRooms[arg.sessionid].password && listOfRooms[arg.sessionid].password != arg.password) {
                    callback(false, CONST_STRINGS.INVALID_PASSWORD);
                    return;
                }
            } catch (e) {
                pushLogs(config, 'join-room.password', e);
            }

            try {
                if (listOfRooms[arg.sessionid].participants.length >= listOfRooms[arg.sessionid].maxParticipantsAllowed) {
                    callback(false, CONST_STRINGS.ROOM_FULL);
                    return;
                }
            } catch (e) {
                pushLogs(config, 'join-room.ROOM_FULL', e);
            }

            // append this user into participants list
            appendToRoom(arg.sessionid, socket.userid);

            try {
                // admin info are shared only with /admin/
                listOfUsers[socket.userid].socket.admininfo = {
                    sessionid       : arg.sessionid,
                    session         : arg.session,
                    mediaConstraints: arg.mediaConstraints,
                    sdpConstraints  : arg.sdpConstraints,
                    streams         : arg.streams,
                    extra           : arg.extra
                };
            } catch (e) {
                pushLogs(config, 'join-room', e);
            }

            JoinStudent();
            sendToAdmin();

            try {
                callback(true, undefined, listOfRooms[arg.sessionid].info);
            } catch (e) {
                pushLogs(config, 'join-room', e);
            }
        });

        socket.on('disconnect', function (reason) {
            try {
                if (socket && socket.namespace && socket.namespace.sockets) {
                    delete socket.namespace.sockets[this.id];
                }
            } catch (e) {
                pushLogs(config, 'disconnect', e);
            }

            try {
                // inform all connected users
                if (listOfUsers[socket.userid]) {
                    for (var s in listOfUsers[socket.userid].connectedWith) {
                        listOfUsers[socket.userid].connectedWith[s].emit('user-disconnected', socket.userid, reason + "3");

                        // sending duplicate message to same socket?
                        // if (listOfUsers[s] && listOfUsers[s].connectedWith[socket.userid]) {
                        //     delete listOfUsers[s].connectedWith[socket.userid];
                        //     listOfUsers[s].socket.emit('user-disconnected', socket.userid, reason + "4");
                        // }
                    }
                }
            } catch (e) {
                pushLogs(config, 'disconnect', e);
            }

            if (listOfRooms[getRoomId()] &&  socket.userid in listOfRooms[getRoomId()].participants){
                LeftClass();
            }

            closeOrShiftRoom();

            delete listOfUsers[socket.userid];

            if (socket.admininfo) {
                if (socket.admininfo.sessionid in listOfRooms &&
                    socket.userid in listOfRooms[socket.admininfo.sessionid].userlist) {
                    delete listOfRooms[socket.admininfo.sessionid].userlist[socket.userid]
                    let idx = listOfRooms[socket.admininfo.sessionid].participants.indexOf(socket.userid);
                    if(idx != -1)
                        listOfRooms[socket.admininfo.sessionid].participants.splice(listOfRooms[socket.admininfo.sessionid].participants.indexOf(socket.userid), 1);
                }
            }

            if (socket.ondisconnect) {
                console.error("if on disconnect", socket.userid);
                try {
                    socket.ondisconnect();
                }
                catch (e) {
                    pushLogs('socket.ondisconnect', e);
                }
            }

            sendToAdmin();
        });

        /*
            Custom Code
        */
       
        socket.on('get-room-info', function (success, error) {
            call_getRoom(room => {
                success(room.info);
            }, errorm => {
                if (error)
                    error(errorm);
            });
        });

        socket.on('update-room-info', function (data, callback) {
            call_getRoom(room => {
                room.info = data;
                if (callback)
                    callback('ok');
            }, e => {
                console.log(e)
            })
        })

        socket.on("show-class-status", function (callback) {
            callback(listOfRooms[getRoomId()])
        })

        socket.on("screen-share-set", function(data, callback){
            call_getRoom(room => {
                room.info.shareScreen = data;
                if (callback)
                    callback('ok');
            }, e => {
                console.log(e)
            })
        })

        socket.on("cam-share-set", function(data, callback){
            call_getRoom(room => {
                room.info.camshare = data;
                if (callback)
                    callback('ok');
            }, e => {
                console.log(e)
            })
        })

        socket.on("get-user-name", function(userid, callback){
            callback(listOfRooms[getRoomId()].userlist[userid]);
        })



        // Login -- 방을 새로 생성
        socket.on('append-room', function(arg, callback){
            appendToRoom(arg.sessionid, arg.userid, true);
            teacherlist[arg.userid] = arg.sessionid;

            socket.admininfo = {
                    sessionid       : arg.sessionid,
                    session         : arg.session,
                    mediaConstraints: arg.mediaConstraints,
                    sdpConstraints  : arg.sdpConstraints,
                    streams         : arg.streams,
                    extra           : arg.extra
            };
            OpenRoom(arg.userid);
            callback({code : 200, text : 'appended room by key : ' + arg.sessionid});
        })

        socket.on('delete-room', function(roomid, callback){
            alertbox("Deleted room", roomid, listOfRooms[roomid].realowner);

            listOfRooms[roomid].participants.forEach((userid) => {
                if(listOfUsers[userid])
                    listOfUsers[userid].socket.emit('deleted-room');
            })

            delete teacherlist[listOfRooms[roomid].realowner]
            delete listOfRooms[roomid]
            callback({code : 200, text : 'deleted'});
        })

        socket.on('get-my-room', function(uid, callback){
            callback(teacherlist[uid]);
        })

        socket.on('get-userlist', function(callback){
            let list = []
            Object.keys(listOfUsers).forEach((e) => {
                list.push(e);
            })
            callback(list);
        })



        //--------------------------------------------------------------------------------//

        function call_getRoom(success, error) {
            let room = getRoom();
            if (room.error) {
                error({ error: room.error });
                return;
            }
            success(room);
        };


        function getRoom() {
            const roomId = getRoomId();
            if (null == roomId) return { error: CONST_STRINGS.ROOM_NOT_AVAILABLE };
            let room = listOfRooms[roomId];
            return room ? room : { error: CONST_STRINGS.ROOM_NOT_AVAILABLE };
        };

        function getRoomId() {
            if (socket.admininfo)
                return socket.admininfo.sessionid;
        };

        function OpenRoom(userid) {
            let openTime    = GetTime();
            let user        = GetUserData();

            if(userid)
                user.userid = userid;

            getRoom().openTime = openTime.full;

            let data = {
                roomOpenDate    : openTime.date,
                roomOpenTime    : openTime.time,
                roomOwner       : user.userid,
                userList        : {}
            }
            data.userList[user.userid] = user;
            fs.writeFileSync("./logs/" + openTime.full + "_" + user.userid + ".json", JSON.stringify(data));
        }

        function JoinStudent() {
            let json = fs.readFileSync(GetLogFilePath());
            json = JSON.parse(json);
            let user = GetUserData();
            json.userList[user.userid] = user;
            fs.writeFileSync(GetLogFilePath(), JSON.stringify(json));
            console.log("Join Student", socket.userid);
        }

        function LeftClass() {
            let room = listOfRooms[getRoomId()];
            let json = JSON.parse(fs.readFileSync(GetLogFilePath()));
            let user = GetUserData();

            if(socket.userid == getRoom().info.shareScreen.userid){
                getRoom().info.shareScreen = {
                    state: false,
                    id: undefined,
                }
            }

            if (room.owner != socket.userid) {
                json.userList[user.userid].leftTime = GetTime().time;
                console.log("Left student", socket.userid);
            }
            else if (room.owner == socket.userid) {
                json.userList[user.userid].leftTime = GetTime().time;
                json.roomCloseTime = GetTime().time;
                console.log("Teacher Left Class", socket.userid);
            }
            fs.writeFileSync(GetLogFilePath(), JSON.stringify(json));
        }

        function GetLogFilePath() {
            return "./logs/" + getRoom().openTime + "_" + getRoom().realowner + ".json";
        }

        function GetUserData() {
            return {
                userid      : socket.userid,
                username    : socket.admininfo.extra.userFullName,
                enterTime   : GetTime().time
            }
        }

        function GetTime() {
            let time = new Date();

            let year = time.getFullYear();
            let month = time.getMonth() + 1;
            let day = time.getDate();

            let hours = ("00" + time.getHours()).slice(-2);
            let min = ("00" + time.getMinutes()).slice(-2);
            let sec = ("00" + time.getSeconds()).slice(-2);

            return {
                date: year + "-" + month + "-" + day,
                time: hours + ":" + min + ":" + sec,
                full: year + "-" + month + "-" + day + "_" + hours + "-" + min + "-" + sec
            }
        }

    }
};
