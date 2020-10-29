// http://127.0.0.1:9001
// http://localhost:9001

const fs = require('fs');
const path = require('path');
const url = require('url');
const db = require('./db');
const session = require('./session');
const email = require('./email');

var httpServer = require('https');

const ioServer = require('socket.io');
const RTCMultiConnectionServer = require('rtcmulticonnection-server');
const eclassSignalingServer = require('./ESignaling-Servers.js');

var PORT = 9001;
var httpApp;

const jsonPath = {
    config  : 'config.json',
    logs    : 'logs.json'
};

if (fs.existsSync('./logs')) {
    fs.rmdirSync('./logs', { recursive: true });   
}

const resolveURL                = RTCMultiConnectionServer.resolveURL;
const getBashParameters         = RTCMultiConnectionServer.getBashParameters;
const BASH_COLORS_HELPER        = RTCMultiConnectionServer.BASH_COLORS_HELPER;
const getValuesFromConfigJson   = RTCMultiConnectionServer.getValuesFromConfigJson;

var config = getBashParameters(getValuesFromConfigJson(jsonPath), BASH_COLORS_HELPER);

db.construct();
email.init();

// if user didn't modifed "PORT" object
// then read value from "config.json"
if(PORT === 9001) {
    PORT = config.port;
}



function serverHandler(request, response) {
    // HTTP_GET handling code goes below
    // start session for an http request - response
    // this will define a session property to the request object
        try {
            var uri, filename;

            try {
                if (!config.dirPath || !config.dirPath.length) {
                    config.dirPath = null;
                }

                uri = url.parse(request.url).pathname;
                filename = path.join(config.dirPath ? resolveURL(config.dirPath) : process.cwd(), uri);
            } catch (e) {
                pushLogs(config, 'url.parse', e);
            }

            filename = (filename || '').toString();

            if (request.method == "POST") {
                let ret = undefined;
                request.on('data', function (e) {
                    session.sessioncheck(request, response);
                    let data = JSON.parse('' + e);
                    
                    session.api(request, data).then((_ret) => {
                        if(!_ret) return;

                        ret = _ret;
                        response.write(JSON.stringify(ret));
                        response.end();
                        return;
                    });

                    db.api(request, data).then((_ret) => {
                        if(!_ret) return;
                        ret = _ret;
                        response.write(JSON.stringify(ret));
                        response.end();
                        return;
                    });

                })
                return;
            }

            if(request.method == 'GET'){
                const split = uri.split('/');
                if(split[1] == 'certification'){
                    db.certification(split[2]).then((_ret) => {
                        console.log(_ret);
                        let msg = '';

                        if(_ret.code == 400){
                            msg += "이미 인증되었거나 만료된 인증 주소입니다";
                        }

                        else if(_ret.code == 200){
                            msg += "인증되었습니다";
                        }

                        let code = "<script type='text/javascript'> \
                        alert('" + msg  + "'); \
                        location.href = location.origin + '/dashboard/login.html' \
                        </script>"

                        response.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                        response.write(code, "utf8");
                        response.end();
                    })
                    return;
                }
                else if(split[1] == 'changepw'){
                    fs.readFile('./dashboard/changepw.html', 'utf8', function (err, file) {

                    // })
                    // db.changepw(split[2]).then((_ret) => {
                        // response.writeHead(200, {'Content-Type': 'text/html;charset=UTF-8'});
                        response.writeHead(200, {
                            'Content-Type': 'text/html;charset=utf8'
                        });
                        response.write(file, "utf8");
                        response.end();
                    })
                    return;
                }
            }

            if (request.method !== 'GET' || uri.indexOf('..') !== -1) {
                try {
                    response.writeHead(401, {
                        'Content-Type': 'text/plain'
                    });
                    response.write('401 Unauthorized: ' + path.join('/', uri) + '\n');
                    response.end();
                    return;
                } catch (e) {
                    pushLogs(config, '!GET or ..', e);
                }
            }

            if (filename.indexOf(resolveURL('/admin/')) !== -1 && config.enableAdmin !== true) {
                try {
                    response.writeHead(401, {
                        'Content-Type': 'text/plain'
                    });
                    response.write('401 Unauthorized: ' + path.join('/', uri) + '\n');
                    response.end();
                    return;
                } catch (e) {
                    pushLogs(config, '!GET or ..', e);
                }
                return;
            }

            var matched = false;
            ['/dashboard/', '/logs/', '/dev/', '/dist/', '/socket.io/', '/node_modules/canvas-designer/', '/admin/', '/ViewerJS/'].forEach(function (item) {
                if (filename.indexOf(resolveURL(item)) !== -1) {
                    matched = true;
                }
            });

            // files from node_modules
            ['RecordRTC.js', 'FileBufferReader.js', 'getStats.js', 'getScreenId.js', 'adapter.js', 'MultiStreamsMixer.js'].forEach(function (item) {
                if (filename.indexOf(resolveURL('/node_modules/')) !== -1 && filename.indexOf(resolveURL(item)) !== -1) {
                    matched = true;
                }
            });

            if (filename.search(/.js|.json/g) !== -1 && !matched) {
                try {
                    response.writeHead(404, {
                        'Content-Type': 'text/plain'
                    });
                    response.write('404 Not Found: ' + path.join('/', uri) + '\n');
                    response.end();
                    return;
                } catch (e) {
                    pushLogs(config, '404 Not Found', e);
                }
            }

            var stats;

            try {
                stats = fs.lstatSync(filename);

                if (filename.search(/dashboard/g) === -1 && filename.search(/admin/g) === -1 && filename.search(/ViewerJS/g) === -1 && stats.isDirectory() && config.homePage === '/dashboard/index.html') {
                    if (response.redirect) {
                        response.redirect('/dashboard/');
                    } else {
                        response.writeHead(301, {
                            'Location': '/dashboard/'
                        });
                    }
                    response.end();
                    return;
                }
            } catch (e) {
                response.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                response.write('404 Not Found: ' + path.join('/', uri) + '\n');
                response.end();
                return;
            }

            try {
                if (fs.statSync(filename).isDirectory()) {
                    response.writeHead(404, {
                        'Content-Type': 'text/html'
                    });

                    if (filename.indexOf(resolveURL('/dashboard/')) !== -1) {
                        filename = filename.replace(resolveURL('/dashboard/'), '');
                        filename += resolveURL('/dashboard/index.html');
                    } else if (filename.indexOf(resolveURL('/admin/')) !== -1) {
                        filename = filename.replace(resolveURL('/admin/'), '');
                        filename += resolveURL('/admin/index.html');
                    } else if (filename.indexOf(resolveURL('/ViewerJS/')) !== -1) {
                        filename = filename.replace(resolveURL('/ViewerJS/'), '');
                        filename += resolveURL('/ViewerJS/index.html');
                    } else if (filename.indexOf(resolveURL('/files/')) !== -1) {
                        filename = filename.replace(resolveURL('/files/'), '');
                        filename += resolveURL('/files/*');
                    } else {
                        filename += resolveURL(config.homePage);
                    }
                }
            } catch (e) {
                pushLogs(config, 'statSync.isDirectory', e);
            }

            var contentType = 'text/plain';
            if (filename.toLowerCase().indexOf('.html') !== -1) {
                contentType = 'text/html';
            }
            if (filename.toLowerCase().indexOf('.css') !== -1) {
                contentType = 'text/css';
            }
            if (filename.toLowerCase().indexOf('.png') !== -1) {
                contentType = 'image/png';
            }
            if (filename.toLowerCase().indexOf('.pdf') !== -1) {
                contentType = 'application/pdf';
            }

            fs.readFile(filename, 'binary', function (err, file) {
                if (err) {
                    response.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    response.write('404 Not Found: ' + path.join('/', uri) + '\n');
                    response.end();
                    return;
                }
                
                try {
                    file = file.replace('connection.socketURL = \'/\';', 'connection.socketURL = \'' + config.socketURL + '\';');
                } catch (e) { }
                
                response.writeHead(200, {
                    'Content-Type': contentType
                });
                response.write(file, 'binary');
                response.end();
            });
        } catch (e) {
            pushLogs(config, 'Unexpected', e);

            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not Found: Unexpected error.\n' + e.message + '\n\n' + e.stack);
            response.end();
        }
}

// See how to use a valid certificate:
// https://github.com/muaz-khan/WebRTC-Experiment/issues/62
var options = {
    key: null,
    cert: null,
    ca: null
};

var pfx = false;

if (!fs.existsSync(config.sslKey)) {
    console.log(BASH_COLORS_HELPER.getRedFG(), 'sslKey:\t ' + config.sslKey + ' does not exist.');
} else {
    pfx = config.sslKey.indexOf('.pfx') !== -1;
    options.key = fs.readFileSync(config.sslKey);
}

if (!fs.existsSync(config.sslCert)) {
    console.log(BASH_COLORS_HELPER.getRedFG(), 'sslCert:\t ' + config.sslCert + ' does not exist.');
} else {
    options.cert = fs.readFileSync(config.sslCert);
}

if (config.sslCabundle) {
    if (!fs.existsSync(config.sslCabundle)) {
        console.log(BASH_COLORS_HELPER.getRedFG(), 'sslCabundle:\t ' + config.sslCabundle + ' does not exist.');
    }

    options.ca = fs.readFileSync(config.sslCabundle);
}

if (pfx === true) {
    options = {
        pfx: sslKey
    };
}

httpApp = httpServer.createServer(options, serverHandler);

RTCMultiConnectionServer.beforeHttpListen(httpApp, config);

httpApp = httpApp.listen(process.env.PORT || PORT, process.env.IP || "0.0.0.0", function() {
    RTCMultiConnectionServer.afterHttpListen(httpApp, config);
});

ioServer(httpApp).on('connection', function(socket) {
    eclassSignalingServer(socket, config);
    const params = socket.handshake.query;

    if (!params.socketCustomEvent) {
        params.socketCustomEvent = 'custom-message';
    }

    socket.on(params.socketCustomEvent, function(message) {
        socket.broadcast.emit(params.socketCustomEvent, message);
    });
});