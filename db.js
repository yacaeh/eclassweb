const MongoClient = require('mongodb').MongoClient;
const crypto    = require('crypto'); 

const dburl = 'mongodb://localhost:27017';
const dbName = 'home-class';

var collections = {};

const dblist = [
    "accounts-teacher",
    "accounts-student"
]

module.exports = {
    db          : undefined,
    _this       : undefined,
    test(){
        MongoClient.connect(dburl, function (err, client) {
            console.log("[MongoDB] Connected successfully to server [",dburl,"]");
            _this.db = client.db(dbName);
            dblist.forEach(element => _this.collections[element] = _this.db.collection(element));
            client.db('test').collection('test').insertOne()
            client.db('test').collection('test').in

        });
    },

    construct(){
        let _this = this;
        MongoClient.connect(dburl, function (err, client) {
            console.log("[MongoDB] Connected successfully to server [",dburl,"]");
            _this.db = client.db(dbName);
            dblist.forEach(element => collections[element] = _this.db.collection(element));
        });
    },

    api : async function(url, data){
        console.log(url);
        console.log(data);
        let find = undefined;

        switch(url){
            case '/sign-up' :
                if(await this.db.collection('accounts-teacher').findOne({id : data.id}) || 
                   await this.db.collection('accounts-student').findOne({id : data.id})){
                    return {code : 400, text : 'exist id'};
                }

                data.uid = this.make_key(8);
                const salt = await crypto.randomBytes(64).toString('base64');
                const key  = await pbkdf2Async(data.pw, salt, 159236, 64, 'sha512');
                data.salt = salt;
                data.pw = key.toString('base64');
                this.db.collection('accounts-' + data.type).insertOne(data);
                return {code : 200, text : 'sign up'};

            case '/sign-in' :
                find = await this.db.collection('accounts-' + data.type).findOne({id : data.id});
                if(!find)
                    return {code : 400, text : 'failed'};

                let pw = await pbkdf2Async(data.pw, find.salt, 159236, 64, 'sha512');
                pw = pw.toString('base64');

                if(find.pw != pw){
                    return {code : 400, text : 'failed'};
                }
                else{
                    return {code : 200, text : 'success'};
                }
        }
        return false;
    },

    make_key(length){
        return crypto.randomBytes(256).toString('hex').substr(100, Math.floor(length / 2)) + 
               crypto.randomBytes(256).toString('base64').substr(50, Math.ceil(length / 2));
    }
}

function pbkdf2Async(password, salt, iterations, keylen, digest) {
    return new Promise( (res, rej) => {
        crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, key) => {
            err ? rej(err) : res(key);
        });
    });
}
