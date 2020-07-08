

/*
    pdf, video, audio, jpg .. 등등
*/

class fileViewerLoader {

    bOpen = false;
    type = 'none';
    ext = 'none';   // 확장자
    url = '';
    bLock = false;

    constructor () {

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
                type = 'video';
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
        fileViewer.setAttribute(
          'src',
          'https://'+window.location.host+'/ViewerJS/#'+url
        );
      
        fileViewer.style.width = '1024px';
        fileViewer.style.height = '724px';
        fileViewer.style.cssText =
          'border: 1px solid black;height:1024px;direction: ltr;margin-left:2%;width:78%;';
        fileViewer.setAttribute('allowFullScreen', '');
        let frame = document
          .getElementById('widget-container')
          .getElementsByTagName('iframe')[0].contentWindow;
      
        frame.document
          .getElementsByClassName('design-surface')[0]
          .appendChild(fileViewer);
        console.log(frame.document
          .getElementsByClassName('design-surface')[0]
          .appendChild(fileViewer));
      
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
    
    page; 
    onpage = function (_page) {}   

    
    constructor () {
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

class videoViewer {
    state;
    time;

}



class fileViewerInfo {
    mViewerLoader = new fileViewerLoader();
    mLoaded = false;
    
    mCurrentViewer;

    // all 
    onopen = function (_type = String, _url = String) {}
    onclose = function () {}        
    onloaded = function (_type = String) {}    
    onsync = function () {}

    // private
    onopeneachtype = function () {}         // 
    oncloseeachtype = function () {}        // 
    onloadedeachtype = function () {}
    onupdateeachtype = function (_data) {}   // 방 동기화 처리
    onsynceachtype = function () {}          // 난입시, 동기화 처리

    getCurrentViewer () {
        return this.mCurrentViewer;
    }

    getCurrentViewerType () {
        return this.mViewerLoader.getType();
    }
   
    initViewer () {        
        switch(this.getCurrentViewerType()){
            case 'pdf' :                
                this.mCurrentViewer = new pdfViewer();
                break;
            case 'video' :
                this.mCurrentViewer = new videoViewer ();
                break;
            case 'img' :
                this.mCurrentViewer = new pdfViewer();
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
        this.mCurrentViewer.setPage(_page);      
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


var mfileViewer = new fileViewerInfo ();

mfileViewer.onopen = function (_type, _url) {

    isSharingFile = true;
    isFileViewer = true;

    console.log('onopen');
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
mfileViewer.onopeneachtype['pdf'] = function () {

    console.log('onopen pdf');

    if(!classroomInfo.viewer.pdf) {
        classroomInfo.viewer.pdf = {};
        classroomInfo.viewer.pdf.page = 1;
    }                
}

mfileViewer.onupdateeachtype['pdf'] = function (_data) {
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

mfileViewer.onsynceachtype['pdf'] = function () {
    console.log('onsync pdf');
    const page = classroomInfo.viewer.pdf.page;     
    mfileViewer.getCurrentViewer().showPage(page);
}

mfileViewer.onloadedeachtype['pdf'] = function () {
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
            console.log('send page');
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
mfileViewer.onopeneachtype['video'] = function () {

    console.log('onopen video');

    // if(!classroomInfo.viewer.pdf) {
    //     classroomInfo.viewer.pdf = {};
    //     classroomInfo.viewer.pdf.page = 1;
    // }                
}

mfileViewer.onupdateeachtype['video'] = function (_data) {
    console.log('onupdate video');            
    const cmd = _data.cmd; 
    switch(cmd)
    {
        
    }
}

mfileViewer.onsynceachtype['video'] = function () {
    console.log('onsync video');
 
}

mfileViewer.onloadedeachtype['video'] = function () {
    console.log('onloaded video');   
}
