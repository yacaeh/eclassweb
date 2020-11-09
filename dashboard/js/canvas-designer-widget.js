// _______________
// Canvas-Designer

// Open-Sourced: https://github.com/muaz-khan/Canvas-Designer

// --------------------------------------------------
// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// --------------------------------------------------

function CanvasDesigner() {
    var designer = this;
    designer.iframe = null;
    designer.pointsLength = 0;
    designer.icons = {};
    designer.callbacks = {};
    
    var syncDataListener = function (data) { };

    function onMessage(event) {
        if (event.data.SyncAllPoint) {
            syncAllPoint(event.data.SyncAllPoint);
            return;
        }

        if (!event.data || event.data.uid !== designer.uid) return;

        if (!!event.data.canvasDesignerSyncData) {
            if (event.data.canvasDesignerSyncData.points)
                designer.pointsLength = event.data.canvasDesignerSyncData.points.length;
            syncDataListener(event.data.canvasDesignerSyncData);
            return;
        }
    }

    function getRandomString() {
        if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
            let a = window.crypto.getRandomValues(new Uint32Array(3));
            let token = '';
            for (var i = 0, l = a.length; i < l; i++) {
                token += a[i].toString(36);
            }
            return token;
        } else {
            return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
        }
    }

    designer.uid = getRandomString();

    designer.appendTo = function (parentNode, callback) {
        callback = callback || function () { };
        let form = document.createElement("div");
        form.style.left = '50px';
        form.style.width =  'calc(100% - 50px)';
        form.style.height = '100%';
        form.style.position = 'absolute';
        parentNode.appendChild(form);
        
        designer.iframe = document.createElement('iframe');
        designer.iframe.onload = function () {
            callback();
            callback = null;
        };
        
        designer.iframe.src = designer.widgetHtmlURL + '?widgetJsURL=' + designer.widgetJsURL + '&icons=' + JSON.stringify(designer.icons);
        designer.iframe.style.width = '100%';
        designer.iframe.style.height = '100%';
        designer.iframe.style.position = 'absolute';
        designer.iframe.style.border = 0;
        window.removeEventListener('message', onMessage);
        window.addEventListener('message', onMessage, false);
        form.appendChild(designer.iframe);
    };

    designer.addSyncListener = function (callback) {
        syncDataListener = callback;
    };

    designer.syncData = function (data) {
        if (!designer.iframe) return;
        designer.postMessage({
            canvasDesignerSyncData: data
        });
    };

    designer.sync = function () {
        if (!designer.iframe) return;
        designer.postMessage({
            syncPoints: true
        });
    };

    designer.postMessage = function (message) {
        if (!designer.iframe) return;
        message.uid = designer.uid;
        designer.iframe.contentWindow.postMessage(message, '*');
    };

}
