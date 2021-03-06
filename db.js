const MongoClient = require('mongodb').MongoClient;
const crypto = require('crypto');
const session = require('./session');
const email = require('./email');

const dburl = 'mongodb://localhost:27017';
const dbName = 'home-class';

let db = undefined;

module.exports = {
    test() {
        MongoClient.connect(dburl, function (err, client) {
            console.log("[MongoDB] Connected successfully to server [", dburl, "]");
            client.db('test').collection('test').findOneAndUpdate()
            client.db('test').collection('test').updateOne()
        });
    },

    construct() {
        MongoClient.connect(dburl, {useUnifiedTopology: true }, function (err, client) {
            console.log("[MongoDB] Connected successfully to server [", dburl, "]");
            db = client.db(dbName);
        });
    },

    api: async function (req, data) {
        let route = req.url;
        let find = undefined;

        switch (route) {
            case '/sign-up':
                if (await db.collection('accounts-teacher').findOne({ id: data.id }) ||
                    await db.collection('accounts-student').findOne({ id: data.id }) || 
                    await db.collection('accounts-wating').findOne({ id: data.id })) {
                    return { code: 400, text: 'exist id' };
                }

                if (await db.collection('accounts-teacher').findOne({ email: data.email }) ||
                    await db.collection('accounts-student').findOne({ email: data.email }) ||
                    await db.collection('accounts-wating').findOne({ email: data.email })) {
                    return { code: 401, text: 'exist email' };
                }

                data.uid = this.make_key(12);
                const salt = await crypto.randomBytes(64).toString('base64');
                const key = await pbkdf2Async(data.pw, salt, 159236, 64, 'sha512');
                data.salt = salt;
                data.pw = key.toString('base64');
                data.certification = this.make_key(32);
                let sendmailret;

                try {
                    sendmailret = await email.sendmail(data.email, data.location + '/certification', data.certification);
                }
                catch (e) {
                    if (e.responseCode == 535) {
                        return { code: 403, text: "wrong email" };
                    }
                }

                if (sendmailret.errcode == 402) {
                    return { code: 402, text: '"You need enter your email data. [./emaildata.json]")' };
                }

                db.collection('accounts-wating').insertOne(data);
                return { code: 200, text: 'sign up' };

            case '/sign-in':
                find = await db.collection('accounts-teacher').findOne({ id: data.id }) ||
                    await db.collection('accounts-student').findOne({ id: data.id }) || 
                    await db.collection('accounts-wating').findOne({ id: data.id });
                if (!find){
                    return { code: 400, text: 'failed' };
                }
                
                let pw = await pbkdf2Async(data.pw, find.salt, 159236, 64, 'sha512');
                pw = pw.toString('base64');
                
                if (find.pw != pw) {
                    return { code: 400, text: 'failed' };
                }
                else {
                    if(find.certification)
                        return { code: 402, text: 'no certification', email : find.email};

                    let logindata = session.login(session.get(req), find.uid);
                    find = await db.collection('accounts-teacher').findOne({ uid: find.uid }) ||
                        await db.collection('accounts-student').findOne({ uid: find.uid });
                    logindata.data = find;
                    return logindata;
                }

            case '/sign-out':
                return session.logout(session.get(req));

            case '/get-now-account':
                let sessiondata = session.session[session.get(req)];

                if (!sessiondata)
                    return { code: 400, text: 'not logined' };

                find = await db.collection('accounts-teacher').findOne({ uid: sessiondata.uid }) ||
                    await db.collection('accounts-student').findOne({ uid: sessiondata.uid });
                return { code: 200, find: 'success', data: find };

            case '/find-id':
                find = await db.collection('accounts-teacher').findOne({ name: data.name, email: data.email }) ||
                    await db.collection('accounts-student').findOne({ name: data.name, email: data.email });

                if (find)
                    return { code: 200, find: 'success', data: find.id };
                return { code: 400, find: 'failed' };

            case '/find-pw':
                try {
                    let code = Math.round((Math.random() * 900000) +100000);
                    find = await db.collection('accounts-teacher').findOne({ id: data.id, email: data.email }) ||
                            await db.collection('accounts-student').findOne({ id: data.id, email: data.email });

                    if (!find) {
                        return { code: 400, text: 'failed' };
                    }

                    await db.collection('accounts-' + find.type).updateOne({id: data.id, email: data.email}, {$set : {cpwcode : code}})

                    let sendmailret;

                    try {
                        sendmailret = await email.sendpwmail(data.email, code);
                    }
                    catch (e) {
                        if (e.responseCode == 535) {
                            return { code: 403, text: "wrong email" };
                        }
                    }
    
                    if (sendmailret.errcode == 402) {
                        return { code: 402, text: '"You need enter your email data. [./emaildata.json]")' };
                    }

                
                    return { code: 200, text: 'sent mail' , uid : find.uid};
                }
                catch(e) {
                    console.log(e);

                    return { code: 400, text: 'failed' };
                }
            
            case '/change-pw' :
                console.log(data);
                find = await db.collection('accounts-' + data.type).findOne({uid : data.uid});
                console.log(find);
                let newpw = await pbkdf2Async(data.pw1, find.salt, 159236, 64, 'sha512');
                await db.collection('accounts-' + data.type).updateOne({ uid: data.uid }, { $set: { pw: newpw.toString('base64') } });
                return {code : 200, data : 'ok'};

            case '/change-pw-check' :
                find = await db.collection('accounts-teacher').findOne({ uid: data.uid }) ||
                        await db.collection('accounts-student').findOne({ uid: data.uid }); 

                if(!find || !find.cpwcode){
                    return {code : 501, data : 'failed'};
                }

                return {code : 200, data : find};
            case '/change-pw-code-check' :
                find = await db.collection('accounts-teacher').findOne({ uid: data.uid , cpwcode : data.code * 1 }) ||
                       await db.collection('accounts-student').findOne({ uid: data.uid , cpwcode : data.code * 1 });
                if(find){
                    await db.collection('accounts-' + find.type).updateOne({uid: data.uid}, { $set : {cpwcode : undefined}});
                    return {code : 200, data : find};
                }
                return {code : 501, text : 'failed', find : find}

            case '/get-log-list' :
                find = await db.collection('log').find({}).toArray();
                return find;
            case '/get-log-data' : 
                find = await db.collection('log').findOne({key : data.key})
                return find;
            case '/delete-log-data' :
                db.collection('log').deleteOne({key : data.key})
                return {code : 200};
        }
        return false;
    },

    make_key(length) {
        return crypto.randomBytes(256).toString('hex').substr(100, length);
    },

    certification: async function (code) {
        const find = await db.collection('accounts-wating').findOne({ certification: code });

        if (!find) {
            return { code: 400, text: 'no data' };
        }

        delete find['location'];
        delete find['certification'];

        await db.collection('accounts-wating').deleteOne({ certification: code });
        await db.collection('accounts-' + find.type).insertOne(find);
        return { code: 200, text: 'success' };
    },

    changepw : async function (code) {
        return {code : 200};
    },

    createRoom : function(room, id){
        room.id = id;
    },

    deleteRoom : function(){
    },

    log : {

        get : async function(origin){
            let data = await db.collection('log').findOne({ key: origin }); 
            return data
        },
        set : function(origin, data){
            delete data._id;
            db.collection('log').updateOne({ key: origin }, {$set : data} , {upsert : true});
        },
        appendRoom : function(origin, data){
            data.key = origin;
            db.collection('log').insertOne(data);
        },
    }

}

function pbkdf2Async(password, salt, iterations, keylen, digest) {
    return new Promise((res, rej) => {
        crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, key) => {
            err ? rej(err) : res(key);
        });
    });
}
