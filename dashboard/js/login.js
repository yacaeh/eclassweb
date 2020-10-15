var connection = new RTCMultiConnection();
connection.socketURL = '/';
connection.connectSocket(function (socket) {
    socket.on('disconnect', function () {
        location.reload();
    });
});
connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: false,
    OfferToReceiveVideo: false
};

let logininfo = SetNowLoginInfo() || undefined;

window.params = {};

logininfo.then((e) => {
    logininfo = e;
    if(e.code == 200){
        logined();
    }
    else{
        logouted();
    }
})

function logined(){
    let btn = document.getElementById("sign-in-btn");
    btn.innerHTML = "로그아웃";
    btn.removeEventListener("click", signin);
    btn.addEventListener("click", signout)
    GetMyRoom(logininfo.data.uid);
    // ChangeUID(logininfo.data.uid);
}

function logouted(){
    let btn = document.getElementById("sign-in-btn");
    btn.innerHTML = "로그인";
    btn.removeEventListener("click", signout);
    btn.addEventListener("click", signin)
}


async function signup(){
    let type = 'teacher';
    
    document.querySelectorAll('input[name=sign-type]').forEach((e) =>{
        if(e.checked){
            type = e.value;
        }
    })


    let name    = document.getElementById("sign-up-name").value;
    let school  = document.getElementById("sign-up-school").value;
    let id      = document.getElementById("sign-up-id").value;
    let pw      = document.getElementById("sign-up-pw").value;
    let pw2     = document.getElementById("sign-up-pw2").value;
    let email   = document.getElementById("sign-up-email").value;

    if(!name || !school || !id || !pw || !pw2 || !email){
        alert("모든 정보를 입력바랍니다.");
        return;
    }

    const emailRule = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;//이메일 정규식
    if(!emailRule.test(email)) {            
        alert("올바른 이메일 형식이 아닙니다.")
        return false;
    }


    var passRule = /^.*(?=^.{6,16}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;
    if(!passRule.test(pw)){
        alert("하나의 특수문자,숫자, 문자 포함 형태의 6~16자리의 비밀번호가 필요합니다");
        return;
    }
    
    if(pw != pw2){
        alert("비밀번호가 서로 일치하지 않습니다.");
        return;
    }

    let data = {
        type    : type,
        name    : name,
        school  : school,
        id      : id,
        pw      : pw,
        email   : email
    }

    console.log("sign-up request", data);

    const ret = await PostAsync("/sign-up", data);
    if(ret.code == 200){
        alert("회원가입이 완료되었습니다");
    }
    else if(ret.code == 400){
        alert("이미 존재하는 아이디입니다");
    }
}

async function signin(){
    let data = {
        id      : document.getElementById("sign-in-id").value,
        pw      : document.getElementById("sign-in-pw").value,
    }

    console.log("sign-in request", data);

    const ret= await PostAsync("/sign-in", data);
    if(ret.code == 200){
        logininfo = ret;
        alert("로그인 되었습니다");
        logined();
    }
    else if(ret.code == 400){
        alert("로그인에 실패하였습니다");
    }
    else if(ret.code == 401){
        alert("이미 로그인 되어있습니다");
    }
    console.log(ret);
}

async function signout(){
    const ret= await PostAsync("/sign-out", {});
    console.log(ret);
    if(ret.code == 200){
        logininfo = undefined;
        alert("로그아웃 되었습니다");
        logouted();
    }
    else if(ret.code == 400)
        alert("이미 로그아웃 되어있습니다");
}



document.getElementById("sign-up-btn").addEventListener("click", (event) =>{
    event.preventDefault();  
    signup();
})

document.getElementById("get-now-info").addEventListener("click", (event) =>{
    event.preventDefault();
    SetNowLoginInfo();
})

document.getElementById("make-room").addEventListener("click",() => {
    if(!logininfo || logininfo.code == 400){
        alert("로그인이 필요합니다.");
        return;
    }

    const key = Math.floor(( 100000 + Math.random() * 900000));

    connection.sessionid = key;
    connection.isInitiator = true;
    connection.session.oneway = true;
    connection.userid = logininfo.data.uid;
    connection.extra.userFullName = logininfo.data.name;

    connection.socket.emit('get-my-room', connection.userid, (e) => {
        if(e){
            alert("이미 개설한 방이 있습니다");
            return;
        }

        let data = {
            sessionid       : key,
            userid          : connection.userid,
            session         : connection.session,
            extra           : connection.extra,
            mediaConstraints: connection.mediaConstraints,
            sdpConstraints  : connection.sdpConstraints,
            identifier      : connection.publicRoomIdentifier,
        }
    
        console.log(data);
        connection.socket.admininfo = 'test~~';
        
        makeroom(data);
        MakeRoomBtn(key);
        alert('방 코드 : ' + key + '로 방 생성');

    })
})

document.getElementById("join-room").addEventListener('click',() => {
    if(!logininfo || logininfo.code == 400){
        alert("로그인이 필요합니다.");
        return;
    }

    const key = document.getElementById("room-number").value;
    connection.extra.userFullName = 'student tester';

    connection.checkPresence(key, function(isRoomExist, a, extra){
        console.log(isRoomExist, a ,extra);
        if(isRoomExist){
            connection.extra.userFullName = logininfo.data.name;
            connection.sessionid = key;
            connection.isInitiator = false;
            connection.session.oneway = true;
            openCanvasDesigner();
        }
        else{
            alert("방 정보를 다시 확인해주세요");
        }
    })
})

function openCanvasDesigner() {
    var href = location.origin + '/dashboard/classroom.html?open=' + connection.isInitiator + '&sessionid=' + connection.sessionid + '&publicRoomIdentifier=' + connection.publicRoomIdentifier + '&userFullName=' + connection.extra.userFullName  + '&bylogin=true' + '&uid=' + logininfo.data.uid; 
    if (!!connection.password) {
        href += '&password=' + connection.password;
    }
    window.open(href,'');
}

function showrooms(){
    connection.socket.emit('show-class-status', (e) => {
        console.log(e);
    })
}

function makeroom(arg){
    connection.socket.emit('append-room', arg, (e) => {
        console.log(e);
    })
}

function GetMyRoom(uid){
    connection.socket.emit('get-my-room', uid, (e) => {
        if(e){
            MakeRoomBtn(e);
        }
    })
}

function MakeRoomBtn(code){
    let btn = document.createElement("button");
    btn.innerHTML = code;
    document.getElementById("my-room").appendChild(btn);
    
    let deletebtn = document.createElement("button");
    deletebtn.innerHTML = "삭제";
    document.getElementById("my-room").appendChild(deletebtn);


    btn.addEventListener("click" ,openCanvasDesigner);

    deletebtn.addEventListener("click" ,function(e){
        connection.socket.emit('delete-room', code, (e) => {
            console.log(e);
            if(e.code == 200 ){
                document.getElementById("my-room").innerHTML = '나의 방';
            }
        })
    })
}