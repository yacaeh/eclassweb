module.exports = {
    session : {},
    parseCookies : (cookie = '') => {
        console.log("cookie : ", cookie);
        return cookie
            .split(';')
            .map(v => v.split('='))
            .map(([k, ...vs]) => [k, vs.join('=')])
            .reduce((acc, [k, v]) => {
                acc[k.trim()] = decodeURIComponent(v);
                return acc;
            }, {});
    },

    sessioncheck(req,res){
        if(!this.get(req)){
            const randomInt = + new Date();
            res.writeHead(200, {'Set-Cookie': 'session=' + randomInt})
            console.log("New seession");
        }
    },

    get(req){
        const cookies = this.parseCookies(req.headers.cookie);
        return cookies.session;
    },

    login(sessionid, uid){
        if (sessionid in this.session) {
            return { code: 401, text: 'already logined' };
        }

        const expires = new Date();
        expires.setMinutes(expires.getMinutes() + 5);
        this.session[sessionid] = {
            uid : uid,
            expires : expires,
        };
        console.log(this.session);
        return { code: 200, text: 'success' };
    },

    logout(sessionid){
        if (sessionid in this.session) {
            delete this.session[sessionid];
            return { code: 200, text: 'logout success' };
        }
        else{
            return { code: 400, text: 'not login' };
        }
    },


    api: async function (req, data) {
        // switch (route) {
        //     case '/get-session':
        //         if (await this.db.collection('accounts-teacher').findOne({ id: data.id }) ||
        //             await this.db.collection('accounts-student').findOne({ id: data.id })) {
        //             return { code: 400, text: 'exist id' };
        //         }

        //         data.uid = this.make_key(8);
        //         const salt = await crypto.randomBytes(64).toString('base64');
        //         const key = await pbkdf2Async(data.pw, salt, 159236, 64, 'sha512');
        //         data.salt = salt;
        //         data.pw = key.toString('base64');
        //         this.db.collection('accounts-' + data.type).insertOne(data);
        //         return { code: 200, text: 'sign up' };
        // }
        // return false;
    },

}
