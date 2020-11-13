function CanvasDesigner() {
    var designer = this;
    designer.iframe = null;
    designer.pointsLength = 0;
    
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

    designer.appendTo = function (callback) {
        callback = callback || function () { };
        designer.iframe = document.getElementById('widget-canvas');
        designer.iframe.onload = function () {
            callback();
            callback = null;
        };
        window.removeEventListener('message', onMessage);
        window.addEventListener('message', onMessage, false);
    };

    designer.addSyncListener = function (callback) {
        syncDataListener = callback;
    };

    designer.syncData = function (data) {
        designer.postMessage({
            canvasDesignerSyncData: data
        });
    };

    designer.sync = function () {
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
