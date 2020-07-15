

/*
    pdf, video, audio, jpg .. 등등
*/

class fileViewerLoader {

    constructor () {
        this.bOpen = false;
        this.type = 'none';
        this.ext = 'none';   // 확장자
        this.url = '';
        this.bLock = false;
    
    }

    setOpenState (_open = Boolean) {
        this.bOpen = _open;
    }

    setUrl (_url = String) {
        this.url = _url
    }

    setExtentionToType (_extention = String) {
        let type = 'none';
        switch(_extention)
        {
            case 'pdf' :
                type = 'pdf';
                break;

            case 'mp4':
            case 'webm':
            case 'mp3':
            case 'avi':
            case 'mkv':
                type = 'media';
                break;

            case 'jpg' :
            case 'png' :
                type = 'img';
                break;
        }
        this.ext = _extention;
        this.type = type;
    }

    
    IsOpen () {
        return this.bOpen;
    }

    IsLock () {
        return this.bLock;
    }

    getUrl () {
        return this.url;
    }

    getType () {
        return this.type;
    }

    getExtention () {
        return this.ext;
    }

    getFileNameToExtention (_fileName) {        
        return _fileName.substr(_fileName.lastIndexOf('.') + 1);
    }   

    openViewer (_url) {

        if(this.IsOpen()) {
            this.closeViewer ();
        }            

        this.setOpenState(true);
        this.setUrl (_url);
        this.setExtentionToType(this.getFileNameToExtention (_url));
        this.createElementViewer (_url);
    }


    closeViewer () {
        this.setOpenState(false);
        this.removeElementViewer ();
    }

    /*
        Element Viewer
    */
    createElementViewer (url) {
        $('#confirm-box').modal('hide');
        $('#confirm-box-topper').hide();      
      
        let fileViewer = document.createElement('iframe');
        fileViewer.setAttribute('id', 'file-viewer');

        let src = 'https://'+window.location.host+'/ViewerJS/#'+url;
        fileViewer.setAttribute( 'src',src);
      
        if(isMobile)
            fileViewer.style.width = "calc(100% - 52px)";

        fileViewer.setAttribute('allowFullScreen', '');
        let frame = document
          .getElementById('widget-container')
          .getElementsByTagName('iframe')[0].contentWindow;
      
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

    removeElementViewer () {
        let frame = document
          .getElementById('widget-container')
          .getElementsByTagName('iframe')[0].contentWindow;
        frame.document.getElementById('main-canvas').style.zIndex = '1';
        frame.document.getElementById('temp-canvas').style.zIndex = '2';
        frame.document.getElementById('tool-box').style.zIndex = '3';
      
        let fileViewer = frame.document.getElementById('file-viewer');
        fileViewer.remove();
    }

    LockViewer (_lock) {
        this.bLock = _lock;

        let frame = document
        .getElementById('widget-container')
        .getElementsByTagName('iframe')[0].contentWindow;
        let fileViewer = frame.document.getElementById('file-viewer');
        let viewer = fileViewer.contentWindow.document.getElementById("viewer")                                  
        if(_lock) {
            viewer.style.pointerEvents = 'none';
        }
        else{
            viewer.style.pointerEvents = '';
        }
    }
}


class pdfViewer {

    constructor () {
        this.onpage = function(_page){}
        this.page = 1;
    }

    /*
        interface method 다른 viewer도 같이 구현을 해야 함.
    */
    getElementFileViewer () {
        let frame = document
        .getElementById('widget-container')
        .getElementsByTagName('iframe')[0].contentWindow;
        let fileViewer = frame.document.getElementById('file-viewer');
        return fileViewer;
    }

    showPage  (_page) {         

        //  현재 같은 페이지이면 바꾸지 않는다.
        if(this.checkSamePage(_page))  return;

        let fileViewer = this.getElementFileViewer ();
        if(!fileViewer)  return;       

        var e = new Event("change");
        $(fileViewer.contentWindow.document.getElementById("pageNumber")).val(_page);
        fileViewer.contentWindow.document.getElementById("pageNumber").dispatchEvent (e);           
        
        this.setPage (_page);        
    }    

    setPage (_page) {
        this.page = _page;
        this.onpage (this.page);
    }

    checkSamePage (_page) {
        return this.page == _page;
    }
}

class mediaViewer {    

    constructor () {
        this.cacheMediaPlayer;    
        this.onplay = null;
        this.onpause = null;
        this.onended = null;
        this.onready = null;
        this.onseeked = null;
        this.ontimeupdate = null;
    }



    setMediaPlayer (_player)  {
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
            if(null != ontimeupdate)
                this.ontimeupdate (this.getCurrentTime());
        })
    }    
  

    hasMediaPlayer () {
        return null != this.cacheMediaPlayer;
    }


    getCurrentTime () {
        if(!this.hasMediaPlayer())  return 0;

        return this.cacheMediaPlayer.currentTime();
    }

    setCurrentTime (_time) {
        if(!this.hasMediaPlayer())  return;        
        this.cacheMediaPlayer.currentTime (_time);
    }

    play (_time) {        
        if(!this.hasMediaPlayer())  return;
        
        this.setCurrentTime (_time);
        this.cacheMediaPlayer.play ();
    }

    pause (_time) {        
        if(!this.hasMediaPlayer())  return;        
        
        this.setCurrentTime(_time);
        this.cacheMediaPlayer.pause ();
    }

    ended () {
        // if(!this.hasMediaPlayer())  return;        
        
        // this.setCurrentTime(_time);
        // this.cacheMediaPlayer.ended ();        
    }

    seeked () {
    }

    setPlay () {                      
       if(null != this.onplay)
        {
            this.onplay(this.getCurrentTime());
        }
    }

    setPause () {             
       if(null != this.onpause) 
        {
            this.onpause (this.getCurrentTime());
        }
    }

    setReady () {       
        if(null != this.onready)
            this.onready ();
    }

    setEnded () {
        if(null != this.onended)
            this.onended ();
    }
}



class fileViewer {
    constructor(){
        this.mViewerLoader = new fileViewerLoader();
        this.mLoaded = false;
        this.mCurrentViewer;
            // all 
    this.onopen = function (_type = String, _url = String) {}
    this.onclose = function () {}        
    this.onloaded = function (_type = String) {}    
    this.onsync = function () {}
    
    // private
    this.onopeneachtype = function () {}         // 
    this.oncloseeachtype = function () {}        // 
    this.onloadedeachtype = function () {}
    this.onupdateeachtype = function (_data) {}   // 방 동기화 처리
    this.onsynceachtype = function () {}          // 난입시, 동기화 처리
    this.onshowpageeachtype = function (_page) {}


    }




    getCurrentViewer () {
        return this.mCurrentViewer;
    }

    getCurrentViewerType () {
        return this.mViewerLoader.getType();
    }
   
    initViewer () {        
        switch(this.getCurrentViewerType()){
            case 'pdf' :     
            case 'img' :                       
                this.mCurrentViewer = new pdfViewer();
                break;
            case 'media' :
                this.mCurrentViewer = new mediaViewer ();
                break;
        }
    }


    openFile (_url) {                
        if(_url == undefined || _url == null)  {
            console.error('open file url error ' + _url);
            return;
        } 

        this.mLoaded = false;
        this.mViewerLoader.openViewer (_url);
        this.initViewer ();

        const type = this.mViewerLoader.getType();
        this.onopen (type, _url);
        if(this.onopeneachtype[type])
            this.onopeneachtype[type]();
    }

    closeFile () {

        this.onclose ();
        const viewerType = this.getCurrentViewerType();
        if(this.oncloseeachtype[viewerType])
            this.oncloseeachtype[viewerType]();

        this.mViewerLoader.closeViewer ();
        this.mCurrentViewer = null;
    }

    hasLoadViewer () {
        return (null != this.mCurrentViewer);
    }


    syncViewer () {        
        const state = classroomInfo.viewer.state;
        if(state) {
            if(this.mViewerLoader.IsOpen()) {
                if(state) {                                      
``
                    if(this.onsync)
                        this.onsync ();

                    //  현재 타입에 따라 동기화
                    if(this.onsynceachtype[this.getCurrentViewerType()])
                        this.onsynceachtype[this.getCurrentViewerType()]();
                }
                else {
                    this.closeFile ();
                }
            }
            else {
                if(state) {
                    // open                    
                    this.openFile (classroomInfo.viewer.url);
                }                
            }
        }
    }


    updateViewer (_data) {
        const cmd = _data.cmd;
        console.log(_data);
        switch(cmd)
        {
            case 'open' :                
                const url = _data.url;                
                this.openFile (url);
                break;

            case 'close' :   
                this.closeFile ();
                break;
            default :
                if(!this.mLoaded)
                    return;
                
                const viewerType = this.getCurrentViewerType();
                if(this.onupdateeachtype[viewerType])
                    this.onupdateeachtype[viewerType] (_data);
                
                break;
        }
    }

    onShowPage (_page) {        
        
        //  showPage      
        if(!this.hasLoadViewer())    return;
        //if(connection.extra.roomOwner)         
        
        const viewerType = this.getCurrentViewerType();
        if(this.onshowpageeachtype[viewerType])
            this.onshowpageeachtype[viewerType](_page);
    }

    onLoadedViewer () {
        if(!this.hasLoadViewer())    return;

        this.mLoaded = true;
        this.onloaded ();        
        const viewerType = this.getCurrentViewerType();        
        if(this.onloadedeachtype[viewerType])
            this.onloadedeachtype[viewerType]();

    } 
}


/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////


var mfileViewer = new fileViewer ();

mfileViewer.onopen = function (_type, _url) {

    isSharingFile = true;
    isFileViewer = true;

    classroomInfo.viewer.type = _type;
    classroomInfo.viewer.url = _url;
    classroomInfo.viewer.state = true;

    if(connection.extra.roomOwner) {
        connection.send({
            viewer : {
                cmd : 'open',
                url : _url                
            }            
        });        
    }
    else {
        if(classroomInfo.allControl) 
            mfileViewer.mViewerLoader.LockViewer (true);
    }
}

mfileViewer.onclose = function () {

    isSharingFile = false;
    isFileViewer = false;

    console.log('close');
    classroomInfo.viewer.state = false;
    classroomInfo.viewer.loaded = false;

    if(connection.extra.roomOwner) 
    {
        connection.send({
            viewer : {
                cmd : 'close'
            }   
        });
    }
}

mfileViewer.onloaded = function (_type) {
    classroomInfo.viewer.loaded = true;
}


mfileViewer.onsync = function () {    
    if(!connection.extra.roomOwner)
    {
        if(classroomInfo.allControl) 
            mfileViewer.mViewerLoader.LockViewer (true);
        else
            mfileViewer.mViewerLoader.LockViewer (false);
    }
}

/*
    PDF fileViewer
*/

let pdfString = 'pdf';

mfileViewer.onopeneachtype[pdfString] = function () {
    console.log('onopen pdf');
    if(!classroomInfo.viewer.pdf) {
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
    switch(cmd)
    {
        // case "first-page" :            
        //     fileJQuery = $("#widget-container").find("#iframe").contents().find("#file-viewer");
        //     fileJQuery.scrollTop();
        //     break;
        // case 'next' :
        //     fileViewer.contentWindow.document.getElementById('next').click();
        //     break;
        // case 'prev' :
        //     fileViewer.contentWindow.document.getElementById('previous').click();
        //     break;
        // case 'last-page' :
        //     fileViewer.contentWindow.document.getElementById('previous').click();
        //     break;
        // case 'fullscreen' :
        //     fileViewer.contentWindow.document.getElementById('fullscreen').click();
        //     break;
        // case 'presentation' :
        //     fileViewer.contentWindow.document.getElementById('presentation').click();
        //     break;
        // case 'zoomIn' :
        //     fileViewer.contentWindow.document.getElementById('zoomIn').click();
        //     break;
        // case 'zoomOut' :
        //     fileViewer.contentWindow.document.getElementById('zoomOut').click();
        //     break;
        case 'page' :                                        
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
        if(connection.extra.roomOwner) {
            
            // 선생님
            if(!classroomInfo.allControl)   return;
            connection.send ({
                viewer : {
                    cmd : 'page',
                    page : page                        
                }
            });            
        }
        else {
            //  학생            
            connection.send({
                studentCmd : {
                    from : connection.userid,
                    cmd : 'pdf-page',
                    data : page
                }        
            });
        }
    }            
}



/*
    Video Viewer
*/
let mediaString = 'media';

mfileViewer.onopeneachtype[mediaString] = function () {
  
    if(!classroomInfo.viewer.media) {
        classroomInfo.viewer.media = {};
        classroomInfo.viewer.media.time = 0;
        classroomInfo.viewer.media.state = 'none';
    }    
}

mfileViewer.onupdateeachtype[mediaString] = function (_data) {
        
    const cmd = _data.cmd; 
    switch(cmd)
    {
        case 'play' :            
            mfileViewer.getCurrentViewer().play ( _data.time);
            break;
        case 'pause' :
            mfileViewer.getCurrentViewer().pause (_data.time);
            break;
    }
}

mfileViewer.onsynceachtype[mediaString] = function () {
    console.log('onsync video');
    switch(classroomInfo.viewer.media.state){
        case 'play':
            mfileViewer.getCurrentViewer().play (classroomInfo.viewer.media.time);
            break;
        case 'pause':
            mfileViewer.getCurrentViewer().pause (classroomInfo.viewer.media.time);
            break;
    } 
}

mfileViewer.onloadedeachtype[mediaString] = function () {

   let viewer = mfileViewer.getCurrentViewer();   
   viewer.onplay = (_currentTime) => {
        
        classroomInfo.viewer.media.state = 'play';        
        classroomInfo.viewer.media.time = _currentTime;

        console.log('onplay');

        if(connection.extra.roomOwner) {
            // send
            connection.send ({
                viewer : {
                    cmd : 'play',
                    time : _currentTime
                }
            });
        }
    }    

    viewer.onpause = (_currentTime) => {

        classroomInfo.viewer.media.state = 'pause';
        classroomInfo.viewer.media.time = _currentTime;

        console.log('onpause');
        if(connection.extra.roomOwner) {
            // send
            connection.send ({
                viewer : {
                    cmd : 'pause',
                    time : _currentTime
                }
            })
        }
    }

    viewer.ontimeupdate = (_currentTime) => {
        classroomInfo.viewer.media.time = _currentTime;
    }
}
