

/*
    pdf, video, audio, jpg .. 등등
*/

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

    /*
        Element Viewer
    */
    createElementViewer(url) {
        $('#confirm-box').modal('hide');
        $('#confirm-box-topper').hide();

        let fileViewer = document.createElement('iframe');
        fileViewer.setAttribute('id', 'file-viewer');

        let src = 'https://' + window.location.host + '/ViewerJS/#' + url;
        fileViewer.setAttribute('src', src);

        if (mobileHelper.isMobile)
            fileViewer.style.width = "calc(100% - 52px)";

        fileViewer.setAttribute('allowFullScreen', '');
        let frame = GetWidgetFrame();

        frame.document
            .getElementsByClassName('design-surface')[0]
            .appendChild(fileViewer);
        // console.log(frame.document
        //   .getElementsByClassName('design-surface')[0]
        //   .appendChild(fileViewer));

        frame.document.getElementById('main-canvas').style.zIndex = '1';
        frame.document.getElementById('temp-canvas').style.zIndex = '2';
        frame.document.getElementById('tool-box').style.zIndex = '3';
    }

    removeElementViewer() {
        let frame = GetWidgetFrame();
        frame.document.getElementById('main-canvas').style.zIndex = '1';
        frame.document.getElementById('temp-canvas').style.zIndex = '2';
        frame.document.getElementById('tool-box').style.zIndex = '3';
        let fileViewer = frame.document.getElementById('file-viewer');
        fileViewer.remove();
        document.getElementById("btn-confirm-file-close").style.display = "none";
    }

    LockViewer(_lock) {
        this.bLock = _lock;

        let frame = GetWidgetFrame();
        let fileViewer = frame.document.getElementById('file-viewer');
        let viewer = fileViewer.contentWindow.document.getElementById("viewer")
        if(!viewer)
            return;
            
        if (_lock) {
            viewer.style.pointerEvents = 'none';
        } 
        else {
            viewer.style.pointerEvents = '';
        }
    }
}
class pdfViewer {

    constructor() {
        this.onpage = function (_page) { }
        this.page = 1;
    }

    /*
        interface method 다른 viewer도 같이 구현을 해야 함.
    */
    getElementFileViewer() {
        let frame = GetWidgetFrame();
        let fileViewer = frame.document.getElementById('file-viewer');
        return fileViewer;
    }

    showPage(_page) {

        //  현재 같은 페이지이면 바꾸지 않는다.
        if (this.checkSamePage(_page)) return;

        let fileViewer = this.getElementFileViewer();
        if (!fileViewer) return;

        var e = new Event("change");
        $(fileViewer.contentWindow.document.getElementById("pageNumber")).val(_page);
        fileViewer.contentWindow.document.getElementById("pageNumber").dispatchEvent(e);

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
        // _player.on('seeked', () => {
        //     console.log('time');
        // });
        // _player.on('playing', () => {
        //     console.log('playing');
        // })

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

    ended() {
        // if(!this.hasMediaPlayer())  return;        

        // this.setCurrentTime(_time);
        // this.cacheMediaPlayer.ended ();        
    }

    seeked() {
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
        if (state) {
            if (this.mViewerLoader.IsOpen()) {
                if (state) {
                    ``
                    if (this.onsync)
                        this.onsync();

                    //  현재 타입에 따라 동기화
                    if (this.onsynceachtype[this.getCurrentViewerType()])
                        this.onsynceachtype[this.getCurrentViewerType()]();
                }
                else {
                    this.closeFile();
                }
            }
            else {
                if (state) {
                    // open                    
                    this.openFile(classroomInfo.viewer.url);
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
                if (!this.mLoaded)
                    return;
                const viewerType = this.getCurrentViewerType();
                if (this.onupdateeachtype[viewerType])
                    this.onupdateeachtype[viewerType](_data);
                break;
        }
    }

    onShowPage(_page) {

        //  showPage      
        if (!this.hasLoadViewer()) return;
        //if(connection.extra.roomOwner)         

        const viewerType = this.getCurrentViewerType();
        if (this.onshowpageeachtype[viewerType])
            this.onshowpageeachtype[viewerType](_page);
    }

    onLoadedViewer() {
        if (!this.hasLoadViewer()) return;

        this.mLoaded = true;
        this.onloaded();
        const viewerType = this.getCurrentViewerType();
        if (this.onloadedeachtype[viewerType])
            this.onloadedeachtype[viewerType]();

    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////

let pdfString = 'pdf';
var mfileViewer         = new fileViewer();


mfileViewer.onopen = function (_type, _url) {

    isSharingFile = true;
    isFileViewer = true;

    classroomInfo.viewer.type = _type;
    classroomInfo.viewer.url = _url;
    classroomInfo.viewer.state = true;

    if (connection.extra.roomOwner) {
        connection.send({
            viewer: {
                cmd: 'open',
                url: _url
            }
        });
    }
    else {
        if (classroomInfo.allControl)
            mfileViewer.mViewerLoader.LockViewer(true);
    }
}

mfileViewer.onclose = function () {
    this.nowPath = undefined;
    isSharingFile = false;
    isFileViewer = false;

    console.log('close');

    pointer_saver.save_container();
    classroomInfo.viewer.state = false;
    classroomInfo.viewer.loaded = false;

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
        if (classroomInfo.allControl)
            mfileViewer.mViewerLoader.LockViewer(true);
        else
            mfileViewer.mViewerLoader.LockViewer(false);
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
    console.log('onupdate pdf');
    const cmd = _data.cmd;
    switch (cmd) {
        case 'page':
            const page = _data.page;
            mfileViewer.getCurrentViewer().showPage(page);
            break;
    }
}

mfileViewer.onsynceachtype[pdfString] = function () {
    console.log('onsync pdf');
    const page = classroomInfo.viewer.pdf.page;
    mfileViewer.getCurrentViewer().showPage(page);
}

mfileViewer.onloadedeachtype[pdfString] = function () {
    console.log('onloaded pdf');
    mfileViewer.getCurrentViewer().setPage(classroomInfo.viewer.pdf.page);
    mfileViewer.getCurrentViewer().onpage = (page) => {

        classroomInfo.viewer.pdf.page = page;
        if (connection.extra.roomOwner) {

            // 선생님
            if (!classroomInfo.allControl) return;
            connection.send({
                viewer: {
                    cmd: 'page',
                    page: page
                }
            });
        }
        else {
        }
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
            // send
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

function HomeworkSubmit(){
    HomeworkUploadModal("숙제 제출")
}

function HomeworkUploadModal(message, callback) {
    callback = callback || function(){}

    console.log(message);
    $('#btn-confirm-close').hide();
    $('#btn-confirm-file-close').hide();
    $("#confirm-title2").hide();
    $('#confirm-title').html(message).removeClass("selected");
    $('#btn-confirm-action').html('닫기').unbind('click').bind('click', function (e) {
        e.preventDefault();
        $('#confirm-box').modal('hide');
        $('#confirm-box-topper').hide();
        callback(true);
    });
    $('#confirm-message').html('<form name="upload" method="POST" enctype="multipart/form-data" action="/upload/"><input id="file-explorer" type="file" multiple accept=".gif,.pdf,.odt,.png,.jpg,.jpeg,.mp4,.webm"></form>');
    $('#confirm-box-topper').show();
    $('#confirm-box').modal({
        backdrop: 'static',
        keyboard: false
    });
    loadFileInput();
}

function fileUploadModal(message, btn, callback) {
    callback = callback || function(){}
    
    console.log(message);
    getUploadFileList();
    $("#confirm-title2").show();
    $('#btn-confirm-action').html('확인').unbind('click').bind('click', function (e) {
        e.preventDefault();
        $('#confirm-box').modal('hide');
        $('#confirm-box-topper').hide();
        callback(true);
    });

    $('#btn-confirm-close').html('취소');

    $('.btn-confirm-close').unbind('click').bind('click', function (e) {
        e.preventDefault();
        $('#confirm-box').modal('hide');
        $('#confirm-box-topper').hide();
        callback(false);
    });

    $('#confirm-message').html('<form name="upload" method="POST" enctype="multipart/form-data" action="/upload/"><input id="file-explorer" type="file" multiple accept=".gif,.pdf,.odt,.png,.jpg,.jpeg,.mp4,.webm"></form>');
    $('#confirm-title').html(message).addClass("selected");
    $('#confirm-title2').html($.i18n('ASSIGNMENT')).removeClass("selected");
    $('#confirm-box-topper').show();

    $('#confirm-box').modal({
        backdrop: 'static',
        keyboard: false
    });
    if (!isFileViewer) $('#btn-confirm-file-close').hide();
    else {
        $('#btn-confirm-file-close').show();
        $('#btn-confirm-file-close').html('현재 파일 닫기').unbind('click').bind('click', function (e) {
            e.preventDefault();
            unloadFileViewer();
        });
    }

    loadFileInput();

}

function ViewHomeworkList(btn) {
    btn.classList.add("selected");
    document.getElementById("confirm-title").classList.remove("selected");
    $("form[name=upload]").hide();
    getUploadFileList("/homework");
}

function ViewUploadList(btn) {
    if(!connection.extra.roomOwner)
        return;

    btn.classList.add("selected");
    document.getElementById("confirm-title2").classList.remove("selected");
    $("form[name=upload]").show();
    getUploadFileList();
}

function getUploadFileList(extraPath) {
    if (typeof extraPath === "undefined")
        extraPath = "";

    var xhr = new XMLHttpRequest();
    var url = fileServerUrl + '/list';
    var data = { "userId": params.sessionid, "extraPath": extraPath };

    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == xhr.DONE) {
            if(xhr.status == 200){
                updateFileList(JSON.parse(xhr.responseText), extraPath);
            }
            else{
                console.error("directory doesn't exist!", xhr.status);
                updateFileList([], extraPath);
            }
        }
    };

    data = JSON.stringify(data);
    xhr.send(data);
}

function updateFileList(list, extraPath) {
    $("#confirm-message .list-group-flush").remove();

    var re = /(?:\.([^.]+))?$/;
    var listElement = '<ul class="list-group-flush">';

    if (list.length == 0){
        listElement += '아직 파일이 없습니다!';
    }
    else {
        list.files.forEach(file => {
            if (file.name == "homework" || re.exec(file.name)[1] == "json")
                return;
    
            var buttons = "";
            if (extraPath == "/homework") {
                buttons = '<button type="button" class="btn btn-safe btn-lg pull-right float-right"  \
            onclick="downloadUploadedFile(\''  + file.url + '\' ,\'' + file.name + '\')"><i class="fa fa-download float-right"></i></button>';
            }
    
            buttons += '<button type="button" class="btn btn-primary btn-lg pull-right float-right" \
          onclick="loadFileViewer(\''+ file.url + '\')"><i class="fa fa-folder float-right"></i></button> \
          <button type="button" class="btn btn-danger btn-lg pull-right float-right" \
          onclick="deleteUploadedFile(\''  + file.name + '\' ,\'' + extraPath + '\')"><i class="fa fa-trash float-right"></i></button>';
    
            listElement += '<li class="list-group-item"><p class="mb-0"><span class="file-other-icon">' +
                getFileType(re.exec(file.name)[1]) + '</span><label>' + file.name +
                '</label>' + buttons;
        })    
    }
    listElement += '</ul>';
    var $listElement = $($.parseHTML(listElement));
    $("#confirm-message").prepend($listElement);
}

function getFileType(ext) {
    // console.log("ext:", ext);
    let element = '';
    if (ext === undefined) {
        element += '<i class="fas fa-folder text-primary"></i>';
    }
    else if (ext.match(/(doc|docx)$/i)) {
        element += '<i class="fas fa-file-word text-primary"></i>';
    }
    else if (ext.match(/(xls|xlsx)$/i)) {
        element += '<i class="fas fa-file-excel text-success"></i>';
    }
    else if (ext.match(/(ppt|pptx)$/i)) {
        element += '<i class="fas fa-file-powerpoint text-danger"></i>';
    }
    else if (ext.match(/(pdf)$/i)) {
        element += '<i class="fas fa-file-pdf text-danger"></i>';
    }
    else if (ext.match(/(zip|rar|tar|gzip|gz|7z)$/i)) {
        element += '<i class="fas fa-file-archive text-muted"></i>';
    }
    else if (ext.match(/(htm|html)$/i)) {
        element += '<i class="fas fa-file-code text-info"></i>';
    }
    else if (ext.match(/(txt|ini|csv|java|php|js|css)$/i)) {
        element += '<i class="fas fa-file-code text-info"></i>';
    }
    else if (ext.match(/(avi|mpg|mkv|mov|mp4|3gp|webm|wmv)$/i)) {
        element += '<i class="fas fa-file-video text-warning"></i>';
    }
    else if (ext.match(/(mp3|wav)$/i)) {
        element += '<i class="fas fa-file-audio text-warning"></i>';
    }
    else if (ext.match(/(jpg)$/i)) {
        element += '<i class="fas fa-file-image text-danger"></i>';
    }
    else if (ext.match(/(gif)$/i)) {
        element += '<i class="fas fa-file-image text-muted"></i>';
    }
    else if (ext.match(/(png)$/i)) {
        element += '<i class="fas fa-file-image text-primary"></i>';
    }
    else {
        element += '<i class="fas fa-file text-muted"></i>';
    }
    // console.log(element);

    return element;
}

function downloadUploadedFile(url, name) {
    fetch(url)
        .then(resp => resp.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(() => alert('oh no!'));
}

function deleteUploadedFile(filename, extraPath) {
    if(mfileViewer.nowPath){
        var nowName = mfileViewer.nowPath.split('/');
        nowName = nowName[nowName.length - 1];
        if(filename == nowName) {
            alert("현재 열려있는 파일은 지울 수 없습니다")
            return;
        }
    }

    var xhr = new XMLHttpRequest();
    var url = fileServerUrl + '/delete';
    var data = {
        "userId": params.sessionid,
        "name": filename,
        "extraPath": extraPath
    };

    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // do something with response
            getUploadFileList(extraPath);
        }
    };
    data = JSON.stringify(data);
    xhr.send(data);
}

function loadFileInput() {

    $(document).ready(function () {
        let extraPath = "";

        if (!connection.extra.roomOwner)
            extraPath = "/homework";

        $("#test-upload").fileinput({
            'theme': 'fas',
            'showPreview': true,
            'language': 'kr',
            'allowedFileExtensions': ["jpg", "gif", "png", "mp4", "webm", "pdf", "jpeg", "odt"],
            'previewFileIcon': "<i class='glyphicon glyphicon-king'></i>",
            'elErrorContainer': '#errorBlock'
        });
        $("#file-explorer").fileinput({
            'theme': 'explorer-fas',
            'language': 'kr',
            'uploadUrl': fileServerUrl + '/upload',
            fileActionSettings: {
                showZoom: false,
            },


            overwriteInitial: false,
            initialPreviewAsData: true,
            initialPreview: [
                // fileServerUrl + "test.pdf",
                // fileServerUrl + "epub/fca2229a-860a-6148-96fb-35eef8b43306/Lesson07.epub/ops/content.opf",
                // fileServerUrl + "small.mp4"
            ],
            initialPreviewConfig: [
                // {caption: "test.pdf", size: 329892, width: "120px", url: "{$url}", key: 1},
                // {caption: "Lesson1.epub", size: 872378, width: "120px", url: "{$url}", key: 2},
                // {caption: "small.mp4", size: 632762, width: "120px", url: "{$url}", key: 3}
            ],
            preferIconicPreview: true, // this will force thumbnails to display icons for following file extensions
            previewFileIconSettings: { // configure your icon file extensions
                'doc': '<i class="fas fa-file-word text-primary"></i>',
                'xls': '<i class="fas fa-file-excel text-success"></i>',
                'ppt': '<i class="fas fa-file-powerpoint text-danger"></i>',
                'pdf': '<i class="fas fa-file-pdf text-danger"></i>',
                'zip': '<i class="fas fa-file-archive text-muted"></i>',
                'htm': '<i class="fas fa-file-code text-info"></i>',
                'txt': '<i class="fas fa-file-text text-info"></i>',
                'mov': '<i class="fas fa-file-video text-warning"></i>',
                'mp3': '<i class="fas fa-file-audio text-warning"></i>',
                // note for these file types below no extension determination logic 
                // has been configured (the keys itself will be used as extensions)
                'jpg': '<i class="fas fa-file-image text-danger"></i>',
                'gif': '<i class="fas fa-file-image text-muted"></i>',
                'png': '<i class="fas fa-file-image text-primary"></i>'
            },
            previewFileExtSettings: { // configure the logic for determining icon file extensions
                'doc': function (ext) {
                    return ext.match(/(doc|docx)$/i);
                },
                'xls': function (ext) {
                    return ext.match(/(xls|xlsx)$/i);
                },
                'ppt': function (ext) {
                    return ext.match(/(ppt|pptx)$/i);
                },
                'zip': function (ext) {
                    return ext.match(/(zip|rar|tar|gzip|gz|7z)$/i);
                },
                'htm': function (ext) {
                    return ext.match(/(htm|html)$/i);
                },
                'txt': function (ext) {
                    return ext.match(/(txt|ini|csv|java|php|js|css)$/i);
                },
                'mov': function (ext) {
                    return ext.match(/(avi|mpg|mkv|mov|mp4|3gp|webm|wmv)$/i);
                },
                'mp3': function (ext) {
                    return ext.match(/(mp3|wav)$/i);
                }
            },
            uploadExtraData: {
                // userId: path
                userId: params.sessionid,
                extraPath: extraPath,
            },

        }).on('fileuploaded', function (event, previewId, index, fileId) {
            console.log('File Uploaded', 'ID: ' + fileId + ', Thumb ID: ' + previewId);
            console.log(previewId.response);
            if (connection.extra.roomOwner)
                getUploadFileList();
        }).on('fileuploaderror', function (event, data, msg) {
            console.log('File Upload Error', 'ID: ' + data.fileId + ', Thumb ID: ' + data.previewId);
        }).on('filebatchuploadcomplete', function (event, preview, config, tags, extraData) {
            console.log('File Batch Uploaded', preview, config, tags, extraData);
        });
    });

}

function LoadFile(btn) {
    if (!isSharingFile && checkSharing()) {
        removeOnSelect(btn);
        return;
    }
    if (!connection.extra.roomOwner)
        return;
    fileUploadModal($.i18n('FILE_MANAGER'), btn, function (e) { });
}


function unloadFileViewer() {
    console.log("UNLOAD FILEVIEWER");
    canvasManager.clear();
    pointer_saver.save();
    pageNavigator.off();

    var btn = GetWidgetFrame().document.getElementById("file");
    btn.classList.remove("selected-shape");
    btn.classList.remove("on");

    isSharingFile = false;
    isFileViewer = false;
    classroomCommand.closeFile();
}

function loadFileViewer(path) {
    if(mfileViewer.nowPath == path){
        alert("같은 파일이 열려있습니다.")
        return;
    }

    mfileViewer.nowPath = path;

    var btn = GetWidgetFrame().document.getElementById("file");
    btn.classList.add("selected-shape");
    btn.classList.add("on");
    
    isSharingFile = true;
    isFileViewer = true;
    classroomCommand.openFile(path);
}

function pdfOnLoaded() {
    console.log("PDF ON");
    classroomCommand.onViewerLoaded();
}

function showPage(n) {
    pointer_saver.save()
    pointer_saver.load(n - 1);
    pageNavigator.select(n - 1);
    if (connection.extra.roomOwner || !classroomInfo.allControl)
        classroomCommand.onShowPage(n);
}
