const MongoClient = require('mongodb').MongoClient;
const crypto = require('crypto');
const session = require('./session');

const dburl = 'mongodb://localhost:27017';
const dbName = 'home-class';

var collections = {};

const dblist = [
    "accounts-teacher",
    "accounts-student"
]



module.exports = {
    db: undefined,
    _this: undefined,
    test() {
        MongoClient.connect(dburl, function (err, client) {
            console.log("[MongoDB] Connected successfully to server [", dburl, "]");
            _this.db = client.db(dbName);
            dblist.forEach(element => _this.collections[element] = _this.db.collection(element));
            client.db('test').collection('test').insertOne()
            client.db('test').collection('test').updateOne()

        });
    },

    construct() {
        let _this = this;
        MongoClient.connect(dburl, function (err, client) {
            console.log("[MongoDB] Connected successfully to server [", dburl, "]");
            _this.db = client.db(dbName);
            dblist.forEach(element => collections[element] = _this.db.collection(element));
        });
    },

    api: async function (req, data) {
        let route = req.url;
        let find = undefined;

        switch (route) {
            case '/sign-up':
                if (await this.db.collection('accounts-teacher').findOne({ id: data.id }) ||
                    await this.db.collection('accounts-student').findOne({ id: data.id })) {
                    return { code: 400, text: 'exist id' };
                }

                if (await this.db.collection('accounts-teacher').findOne({ email: data.email }) ||
                    await this.db.collection('accounts-student').findOne({ email: data.email })) {
                    return { code: 401, text: 'exist email' };
                }

                data.uid = this.make_key(8);
                const salt = await crypto.randomBytes(64).toString('base64');
                const key = await pbkdf2Async(data.pw, salt, 159236, 64, 'sha512');
                data.salt = salt;
                data.pw = key.toString('base64');
                this.db.collection('accounts-' + data.type).insertOne(data);
                return { code: 200, text: 'sign up' };

            case '/sign-in':
                find = await this.db.collection('accounts-teacher').findOne({ id: data.id }) ||
                    await this.db.collection('accounts-student').findOne({ id: data.id });
                if (!find)
                    return { code: 400, text: 'failed' };

                let pw = await pbkdf2Async(data.pw, find.salt, 159236, 64, 'sha512');
                pw = pw.toString('base64');

                if (find.pw != pw) {
                    return { code: 400, text: 'failed' };
                }
                else {
                    let logindata = session.login(session.get(req), find.uid);
                    find = await this.db.collection('accounts-teacher').findOne({ uid: find.uid }) ||
                        await this.db.collection('accounts-student').findOne({ uid: find.uid });
                    logindata.data = find;
                    return logindata;
                }

            case '/sign-out':
                return session.logout(session.get(req));

            case '/get-now-account':
                let sessiondata = session.session[session.get(req)];

                if (!sessiondata)
                    return { code: 400, text: 'not logined' };

                find = await this.db.collection('accounts-teacher').findOne({ uid: sessiondata.uid }) ||
                    await this.db.collection('accounts-student').findOne({ uid: sessiondata.uid });
                return { code: 200, find: 'success', data: find };

            case '/find-id':
                find = await this.db.collection('accounts-teacher').findOne({ name: data.name, email: data.email }) ||
                    await this.db.collection('accounts-student').findOne({ name: data.name, email: data.email });

                if (find)
                    return { code: 200, find: 'success', data: find.id };
                return { code: 400, find: 'failed' };

            case '/find-pw' :
                try{

                    find = await this.db.collection('accounts-teacher').findOne({ id : data.id, email : data.email }) ||
                    await this.db.collection('accounts-student').findOne({ id : data.id, email : data.email });

                    if(!find){
                        return { code : 400 , text : 'failed'};
                    }

                    let newpw = await pbkdf2Async(data.pw, find.salt, 159236, 64, 'sha512');
                    
                    await this.db.collection('accounts-teacher').updateOne({ id : data.id } , {$set : {pw : newpw.toString('base64')}} ) ||
                    await this.db.collection('accounts-student').updateOne({ id : data.id } , {$set : {pw : newpw.toString('base64')}} );
                    
                    return { code : 200 , text : 'password changed'}
                }
                catch{
                    return { code : 400 , text : 'failed'};
                }
               
        }
        return false;
    },

    make_key(length) {
        return crypto.randomBytes(256).toString('hex').substr(100, Math.floor(length / 2)) +
            crypto.randomBytes(256).toString('base64').substr(50, Math.ceil(length / 2));
    }
}

function pbkdf2Async(password, salt, iterations, keylen, digest) {
    return new Promise((res, rej) => {
        crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, key) => {
            err ? rej(err) : res(key);
        });
    });
}
