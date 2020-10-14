
signup();
signin();
signout();
getNowLoginInfo();

function signup(){
    document.getElementById("sign-up-btn").addEventListener("click", (event) => {
        event.preventDefault();
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

        Post('/sign-up', data, function(e){
            e = JSON.parse(e);
            if(e.code == 200){
                alert("회원가입이 완료되었습니다");
            }
            else if(e.code == 400){
                alert("이미 존재하는 아이디입니다");
            }
        })
    })
}

function signin(){
    document.getElementById("sign-in-btn").addEventListener("click", (event) => {
        event.preventDefault();

        let data = {
            id      : document.getElementById("sign-in-id").value,
            pw      : document.getElementById("sign-in-pw").value,
        }

        console.log("sign-in request", data);

        Post('/sign-in', data, function(e){
            e = JSON.parse(e);
            if(e.code == 200){
                alert("로그인 되었습니다");
            }
            else if(e.code == 400){
                alert("로그인에 실패하였습니다");
            }
            else if(e.code == 401){
                alert("이미 로그인 되어있습니다");
            }
            console.log(e);
        })
    })
}

function signout(){
    document.getElementById("sign-out-btn").addEventListener('click', (event) => {
        event.preventDefault();

        Post('/sign-out', {}, function(e){
            e = JSON.parse(e);
            console.log(e);
            if(e.code == 200){
                alert("로그아웃 되었습니다");
            }
            else if(e.code == 400){
                alert("이미 로그아웃 되어있습니다");
            }
        })
    })
}

function getNowLoginInfo(){
    document.getElementById("get-now-info").addEventListener("click", (event) =>{
        event.preventDefault();
        Post('/get-now-account',{}, function(e) {
            e = JSON.parse(e);
            console.log(e)
        })
    })
}