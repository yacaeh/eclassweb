class fileViewerLoader {
    constructor() {
        this.bOpen = false;
        this.type = 'none';
        this.ext = 'none';   // 확장자
        this.url = '';
        this.bLock = false;
    }

    setOpenState(_open = Boolean) {
        this.bOpen = _open;
    }

    setUrl(_url = String) {
        this.url = _url
    }

    setExtentionToType(_extention = String) {
        let type = 'none';
        switch (_extention) {
            case 'pdf':
                type = 'pdf';
                break;

            case 'mp4':
            case 'webm':
            case 'mp3':
            case 'avi':
            case 'mkv':
                type = 'media';
                break;

            case 'jpg':
            case 'png':
                type = 'img';
                break;
        }
        this.ext = _extention;
        this.type = type;
    }


    IsOpen() {
        return this.bOpen;
    }

    IsLock() {
        return this.bLock;
    }

    getUrl() {
        return this.url;
    }

    getType() {
        return this.type;
    }

    getExtention() {
        return this.ext;
    }

    getFileNameToExtention(_fileName) {
        return _fileName.substr(_fileName.lastIndexOf('.') + 1);
    }

    openViewer(_url) {
        if (this.IsOpen()) {
            this.closeViewer();
        }

        this.setOpenState(true);
        this.setUrl(_url);
        this.setExtentionToType(this.getFileNameToExtention(_url));
        this.createElementViewer(_url);
    }

    closeViewer() {
        this.setOpenState(false);
        this.removeElementViewer();
    }

    createElementViewer(url) {
        $('#confirm-box').modal('hide');

        let fileViewer = document.createElement('iframe');
        fileViewer.setAttribute('id', 'file-viewer');
        fileViewer.setAttribute('src', 'https://' + window.location.host + '/ViewerJS/#' + url);

        if (store.getState().isMobile)
            fileViewer.style.width = "calc(100%)";

        fileViewer.setAttribute('allowFullScreen', '');
        GetWidgetFrame().document.getElementsByClassName('design-surface')[0].appendChild(fileViewer);
    }

    removeElementViewer() {
        try{
            GetWidgetFrame().document.getElementById('file-viewer').remove();
        }
        catch(e){

        }
    }

    LockViewer(_lock) {
        this.bLock = _lock;
        let viewer = GetWidgetFrame().document.getElementById('file-viewer')
                        .contentWindow.document.getElementById("viewer")
        if (viewer)
            viewer.style.pointerEvents = _lock ? 'none' : '';
    }
}

class pdfViewer {
    constructor() {
        this.onpage = function (_page) { }
        this.page = 1;
    }

    getElementFileViewer() {
        return GetWidgetFrame().document.getElementById('file-viewer');
    }

    showPage(_page) {
        console.log(_page);

        let fileViewer = this.getElementFileViewer();
        if (!fileViewer) return;
        this.setPage(_page);
    }

    setPage(_page) {
        this.page = _page;
        this.onpage(this.page);
    }

    checkSamePage(_page) {
        return this.page == _page;
    }
}
class mediaViewer {
    constructor() {
        this.cacheMediaPlayer;
        this.onplay = null;
        this.onpause = null;
        this.onended = null;
        this.onready = null;
        this.onseeked = null;
        this.ontimeupdate = null;
    }

    setMediaPlayer(_player) {
        this.cacheMediaPlayer = _player;
        _player.on('play', () => this.setPlay());
        _player.on('pause', () => this.setPause());
        _player.on('ready', () => this.setReady());
        _player.on('ended', () => this.setEnded());
        _player.on('timeupdate', () => {
            if (null != ontimeupdate)
                this.ontimeupdate(this.getCurrentTime());
        })
    }

    hasMediaPlayer() {
        return null != this.cacheMediaPlayer;
    }

    getCurrentTime() {
        if (!this.hasMediaPlayer()) return 0;
        return this.cacheMediaPlayer.currentTime();
    }

    setCurrentTime(_time) {
        if (!this.hasMediaPlayer()) return;
        this.cacheMediaPlayer.currentTime(_time);
    }

    play(_time) {
        if (!this.hasMediaPlayer()) return;
        this.setCurrentTime(_time);
        this.cacheMediaPlayer.play();
    }

    pause(_time) {
        if (!this.hasMediaPlayer()) return;
        this.setCurrentTime(_time);
        this.cacheMediaPlayer.pause();
    }

    setPlay() {
        if (null != this.onplay) {
            this.onplay(this.getCurrentTime());
        }
    }

    setPause() {
        if (null != this.onpause) {
            this.onpause(this.getCurrentTime());
        }
    }

    setReady() {
        if (null != this.onready)
            this.onready();
    }

    setEnded() {
        if (null != this.onended)
            this.onended();
    }
}

class fileViewer {
    constructor() {
        this.mViewerLoader = new fileViewerLoader();
        this.mLoaded = false;
        this.mCurrentViewer;
        // all 
        this.onopen = function (_type = String, _url = String) { }
        this.onclose = function () { }
        this.onloaded = function (_type = String) { }
        this.onsync = function () { }

        // private
        this.onopeneachtype = function () { }         // 
        this.oncloseeachtype = function () { }        // 
        this.onloadedeachtype = function () { }
        this.onupdateeachtype = function (_data) { }   // 방 동기화 처리
        this.onsynceachtype = function () { }          // 난입시, 동기화 처리
        this.onshowpageeachtype = function (_page) { }

        this.nowPath = undefined;
    }

    getCurrentViewer() {
        return this.mCurrentViewer;
    }

    getCurrentViewerType() {
        return this.mViewerLoader.getType();
    }

    initViewer() {
        switch (this.getCurrentViewerType()) {
            case 'pdf':
            case 'img':
                this.mCurrentViewer = new pdfViewer();
                break;
            case 'media':
                this.mCurrentViewer = new mediaViewer();
                break;
        }
    }

    openFile(_url) {

        if (_url == undefined || _url == null) {
            console.error('open file url error ' + _url);
            return;
        }

        pointer_saver.load_container(_url);
        this.mLoaded = false;
        this.mViewerLoader.openViewer(_url);
        this.initViewer();

        const type = this.mViewerLoader.getType();
        this.onopen(type, _url);
        if (this.onopeneachtype[type])
            this.onopeneachtype[type]();
    }

    closeFile() {

        this.onclose();
        const viewerType = this.getCurrentViewerType();
        if (this.oncloseeachtype[viewerType])
            this.oncloseeachtype[viewerType]();

        this.mViewerLoader.closeViewer();
        this.mCurrentViewer = null;
    }

    hasLoadViewer() {
        return (null != this.mCurrentViewer);
    }

    syncViewer() {
        const state = classroomInfo.viewer.state;

        if(!state) return;
        
        if(state) {
            if (this.mViewerLoader.IsOpen()) {
                if (state) {
                    if (this.onsync)
                        this.onsync();

                    if (this.onsynceachtype[this.getCurrentViewerType()])
                        this.onsynceachtype[this.getCurrentViewerType()]();
                }
                else {
                    this.closeFile();
                }
            }
            else {
                if (state) {
                    this.openFile(classroomInfo.viewer.url);
                    const viewerType = this.getCurrentViewerType();
                    console.log(viewerType);
                    this.onshowpageeachtype[viewerType] && this.onshowpageeachtype[viewerType](classroomInfo.viewer.pdf.page);
                }
            }
        }
    }

    updateViewer(_data) {
        const cmd = _data.cmd;
        this.nowPath = _data.url;

        switch (cmd) {
            case 'open':
                const url = _data.url;
                this.openFile(url);
                break;
            case 'close':
                this.closeFile();
                break;
            default:
                if (!this.mLoaded) return;
                this.onupdateeachtype[viewerType] && 
                    this.onupdateeachtype[this.getCurrentViewerType()](_data);
                break;
        }
    }

    onShowPage(_page) {
        if (!this.hasLoadViewer()) return;
        const viewerType = this.getCurrentViewerType();
        this.onshowpageeachtype[viewerType] && this.onshowpageeachtype[viewerType](_page);
    }

    onLoadedViewer() {
        if (!this.hasLoadViewer()) return;
        this.mLoaded = true;
        this.onloaded();
        const viewerType = this.getCurrentViewerType();
        this.onloadedeachtype[viewerType] && this.onloadedeachtype[viewerType]();

    }
}

let pdfString = 'pdf';
var mfileViewer = new fileViewer();

mfileViewer.onopen = function (_type, _url) {
    classroomInfo.viewer.type = _type;
    classroomInfo.viewer.url = _url;
    classroomInfo.viewer.state = true;

    classroomManager.updateClassroomInfo();

    if (connection.extra.roomOwner) {
        connection.send({viewer: {cmd: 'open', url: _url}});
    }
    else {
        if (classroomInfo.allControl)
            mfileViewer.mViewerLoader.LockViewer(true);
    }
}

mfileViewer.onclose = function () {
    this.nowPath = undefined;
    console.debug('PDF close');
    console.log(window.currentPoints);
    pointer_saver.nowIdx = 0;
    pointer_saver.save_container();
    classroomInfo.viewer.state = false;
    classroomInfo.viewer.loaded = false;
    classroomManager.updateClassroomInfo();

    if (connection.extra.roomOwner) {
        connection.send({
            viewer: {
                cmd: 'close'
            }
        });
    }
}

mfileViewer.onloaded = function (_type) {
    classroomInfo.viewer.loaded = true;
}

mfileViewer.onsync = function () {
    if (!connection.extra.roomOwner) {
        mfileViewer.mViewerLoader.LockViewer(classroomInfo.allControl);
    }
}

mfileViewer.onopeneachtype[pdfString] = function () {
    console.log('onopen pdf');
    if (!classroomInfo.viewer.pdf) {
        classroomInfo.viewer.pdf = {};
        classroomInfo.viewer.pdf.page = 1;
    }
}

mfileViewer.onshowpageeachtype[pdfString] = function (_page) {
    mfileViewer.getCurrentViewer().setPage(_page);
}

mfileViewer.onupdateeachtype[pdfString] = function (_data) {
    console.log('onupdate pdf',_data);
    const cmd = _data.cmd;
    switch (cmd) {
        case 'page':
            pageNavigator.button(_data.page-1);
            break;
    }
}

mfileViewer.onsynceachtype[pdfString] = function () {
    const page = classroomInfo.viewer.pdf.page;
    console.log('onupdate pdf', page);
    pageNavigator.button(page-1);
}

mfileViewer.onloadedeachtype[pdfString] = function () {
    console.log('onloaded pdf');
    mfileViewer.getCurrentViewer().setPage(classroomInfo.viewer.pdf.page);
    mfileViewer.getCurrentViewer().onpage = (page) => {
        classroomInfo.viewer.pdf.page = page;
        if (connection.extra.roomOwner && classroomInfo.allControl) 
            connection.send({viewer: { cmd: 'page', page}
        });
    }
}
/*
    Video Viewer
*/
let mediaString = 'media';

mfileViewer.onopeneachtype[mediaString] = function () {

    if (!classroomInfo.viewer.media) {
        classroomInfo.viewer.media = {};
        classroomInfo.viewer.media.time = 0;
        classroomInfo.viewer.media.state = 'none';
    }
}

mfileViewer.onupdateeachtype[mediaString] = function (_data) {

    const cmd = _data.cmd;
    switch (cmd) {
        case 'play':
            mfileViewer.getCurrentViewer().play(_data.time);
            break;
        case 'pause':
            mfileViewer.getCurrentViewer().pause(_data.time);
            break;
    }
}

mfileViewer.onsynceachtype[mediaString] = function () {
    console.log('onsync video');
    switch (classroomInfo.viewer.media.state) {
        case 'play':
            mfileViewer.getCurrentViewer().play(classroomInfo.viewer.media.time);
            break;
        case 'pause':
            mfileViewer.getCurrentViewer().pause(classroomInfo.viewer.media.time);
            break;
    }
}

mfileViewer.onloadedeachtype[mediaString] = function () {

    let viewer = mfileViewer.getCurrentViewer();
    viewer.onplay = (_currentTime) => {

        classroomInfo.viewer.media.state = 'play';
        classroomInfo.viewer.media.time = _currentTime;

        console.log('onplay');

        if (connection.extra.roomOwner) {
            connection.send({
                viewer: {
                    cmd: 'play',
                    time: _currentTime
                }
            });
        }
    }

    viewer.onpause = (_currentTime) => {

        classroomInfo.viewer.media.state = 'pause';
        classroomInfo.viewer.media.time = _currentTime;

        console.log('onpause');
        if (connection.extra.roomOwner) {
            // send
            connection.send({
                viewer: {
                    cmd: 'pause',
                    time: _currentTime
                }
            })
        }
    }

    viewer.ontimeupdate = (_currentTime) => {
        classroomInfo.viewer.media.time = _currentTime;
    }
}

function showPage(n) {
    pointer_saver.save()
    pointer_saver.load(n - 1);
    pageNavigator.select(n - 1);
    if (connection.extra.roomOwner || !classroomInfo.allControl)
         mfileViewer.onShowPage(n);
}
