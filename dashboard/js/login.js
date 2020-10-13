
signup();
signin();

function signup(){
    document.getElementById("sign-up-btn").addEventListener("click", () => {
        let type = 'teacher';
        document.querySelectorAll('input[name=sign-type]').forEach((e) =>{
            if(e.checked){
                type = e.value;
            }
        })
        let data = {
            type    : type,
            name    : document.getElementById("sign-up-name").value,
            school  : document.getElementById("sign-up-school").value,
            id      : document.getElementById("sign-up-id").value,
            pw      : document.getElementById("sign-up-pw").value,
        }

        console.log("sign-up request", data);

        Post('/sign-up', data, function(e){
            e = JSON.parse(e);
            console.log(e);
        })
    })
}

function signin(){
    document.getElementById("sign-in-btn").addEventListener("click", () => {
        let data = {
            id      : document.getElementById("sign-in-id").value,
            pw      : document.getElementById("sign-in-pw").value,
        }

        console.log("sign-in request", data);

        Post('/sign-in', data, function(e){
            e = JSON.parse(e);
            console.log(e);
        })
    })
}
