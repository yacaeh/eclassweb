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
var passRule = /^.*(?=^.{6,16}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;

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
}

function logouted(){
    let btn = document.getElementById("sign-in-btn");
    btn.innerHTML = "로그인";
    btn.removeEventListener("click", signout);
    btn.addEventListener("click", signin)
    document.getElementById("my-room").innerHTML = '나의 방';
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
        email   : email,
        location : location.origin
    }

    console.log("sign-up request", data);

    const ret = await PostAsync("/sign-up", data);
    if(ret.code == 200){
        alert("입력한 이메일로 메일을 전송했습니다");
    }
    else if(ret.code == 400){
        alert("이미 등록된 아이디입니다");
    }
    else if(ret.code == 401){
        alert("이미 등록된 이메일입니다")
    }
    else if(ret.code == 402){
        alert("enter your email info in ./emaildata.json");
    }
    else if(ret.code == 403){
        alert("wrong email");
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

async function findid(){
    let name = document.getElementById("find-id-name").value;
    let email = document.getElementById('find-id-email').value;

    if(!name || !email){
        alert("모든 정보를 입력해주세요");
        return;
    }

    const ret = await PostAsync("/find-id", {name, email});
    if(ret.code == 200){
        alert("아이디는 " + ret.data + "입니다");
    }
    else if(ret.code == 400){
        alert("일치하는 아이디가 없습니다");
    }
    console.log(ret);
}

async function findpw(){
    let id = document.getElementById("find-pw-id").value;
    let email = document.getElementById('find-pw-email').value;
    let pw = document.getElementById('find-pw-pw').value;
    let pw2 = document.getElementById('find-pw-pw2').value;
    
    if(!passRule.test(pw)){
        alert("하나의 특수문자,숫자, 문자 포함 형태의 6~16자리의 비밀번호가 필요합니다");
        return;
    }
    
    if(pw != pw2){
        alert("비밀번호가 서로 일치하지 않습니다.");
        return;
    }

    const ret = await PostAsync("/find-pw", {id, email, pw});
    if(ret.code == 200){
        alert("비밀번호가 변경되었습니다.");
    }
    else{
        alert("비밀번호 변경에 실패했습니다.")
    }


}

document.getElementById("sign-up-btn").addEventListener("click", signup)

document.getElementById("get-now-info").addEventListener("click", SetNowLoginInfo)

document.getElementById("make-room").addEventListener("click",() => {
    if(!logininfo || logininfo.code == 400){
        alert("로그인이 필요합니다.");
        return;
    }

    const key = Math.floor(( 100000 + Math.random() * 900000));

    connection.userid               = logininfo.data.uid;
    connection.sessionid            = key;
    connection.isInitiator          = true;
    connection.session.oneway       = true;
    connection.extra.userFullName   = logininfo.data.name;

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

document.getElementById("find-id-btn").addEventListener('click', findid);

document.getElementById('find-pw-btn').addEventListener('click', findpw);

function openCanvasDesigner() {
    var href = location.origin + '/dashboard/classroom.html?open=' + connection.isInitiator + '&sessionid=' + connection.sessionid; 
    if (!!connection.password) {
        href += '&password=' + connection.password;
    }
    window.open(href,'');
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


    btn.addEventListener("click" , () => {
        openCanvasDesigner();
    });

    deletebtn.addEventListener("click" ,function(e){
        connection.socket.emit('delete-room', code, (e) => {
            console.log(e);
            if(e.code == 200 ){
                document.getElementById("my-room").innerHTML = '나의 방';
            }
        })
    })
}