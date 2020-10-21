var nodemailer = require('nodemailer');
var smtpTransporter = require('nodemailer-smtp-transport');
const fs = require('fs')

module.exports = {
    init(){
        let file = fs.existsSync('./emaildata.json');
        if(!file){
            console.log("You need enter your email data. [./emaildata.json]");
            fs.writeFileSync('./emaildata.json', '{"email":{"id":"", "pw":""}}');
        }
    },
    
    sendmail : async function(to , location, code){
        let jsondata = JSON.parse(fs.readFileSync('./emaildata.json'));
    
        var smtpTransport = nodemailer.createTransport(smtpTransporter({
            service: 'Gmail',
            host:'smtp.gmail.com',
            auth: {
                user: jsondata.email.id,
                pass: jsondata.email.pw
            }
        }));
        
        var data = {
            from        : jsondata.email.id,
            to          : to,
            subject     : '이메일 인증을 진행해주세요.',
            html        : '<a href=' + location + '/certification/' + code + '>인증하기</a>'
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