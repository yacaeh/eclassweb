var nodemailer = require('nodemailer');
var smtpTransporter = require('nodemailer-smtp-transport');
const fs = require('fs')

let jsondata;
let smtpTransport;

module.exports = {
    init(){
        let file = fs.existsSync('./emaildata.json');
        if(!file){
            console.log("You need enter your email data. [./emaildata.json]");
            fs.writeFileSync('./emaildata.json', '{"email":{"id":"", "pw":""}}');
        }
        jsondata = JSON.parse(fs.readFileSync('./emaildata.json'));
        smtpTransport = nodemailer.createTransport(smtpTransporter({
            service: 'Gmail',
            host:'smtp.gmail.com',
            auth: {
                user: jsondata.email.id,
                pass: jsondata.email.pw
            }
        }));
    },
    
    sendmail : async function(to , location, code){
        
        var data = {
            from        : jsondata.email.id,
            to          : to,
            subject     : '이메일 인증을 진행해주세요.',
            html        : '<a href=' + location + '/' + code + '>인증하기</a>'
        };
        
        if(!jsondata.email.id){
            console.log("You need enter your email data. [./emaildata.json]");
            return {
                status  : 'failed',
                errcode : 402,
            }
        }

        const ret = await smtpTransport.sendMail(data);
        console.log(ret);
        return ret
    },

    sendpwmail : async function(to, code){
        var data = {
            from        : jsondata.email.id,
            to          : to,
            subject     : '패스워드 변경 인증 코드입니다.',
            html        : '<div>' + code + '를 입력해주세요 </div>'
        };
        
        if(!jsondata.email.id){
            console.log("You need enter your email data. [./emaildata.json]");
            return {
                status  : 'failed',
                errcode : 402,
            }
        }
        const ret = await smtpTransport.sendMail(data);
        console.log(ret);
        return ret
    }
}
