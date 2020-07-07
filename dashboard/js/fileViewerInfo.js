

/*
    pdf, video, audio, jpg .. 등등
*/

class fileViewerLoader {

    bOpen = false;
    type = 'none';
    ext = 'none';   // 확장자
    url = '';

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

        this.type = type;
    }

    
    IsOpen () {
        return this.bOpen;
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

    openFile (_url) {

        if(this.IsOpen()) {
            this.closeFile ();
        }            

        this.setOpenState(true);
        this.setUrl (_url);
        this.setExtentionToType(this.getFileNameToExtention (_url));
        this.createElementViewer (_url);
    }


    closeFile () {
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

    pdfViewerLock(_lock) {
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

    update (_data) {                       
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
                this.showPage (page);
                break;
        }
    }


    getElementFileViewer () {
        let frame = document
        .getElementById('widget-container')
        .getElementsByTagName('iframe')[0].contentWindow;
        let fileViewer = frame.document.getElementById('file-viewer');
        return fileViewer;
    }

    showPage  (_page) {
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
    
}

class videoViewer {
    state;
    time;

    update (_data) {

    }
}



class fileViewerInfo {


    mViewerLoader = new fileViewerLoader();
    
    currentViewer;

    onclose = function () {}
    onopen = function (_type = String) {}
    onloaded = function (_type = String) {}    

    

    getCurrentViewer () {
        return this.currentViewer;
    }
   
    initViewer () {        
        switch(this.mViewerLoader.getType()){
            case 'pdf' :                
                this.currentViewer = new pdfViewer();
                break;
            case 'video' :
                this.currentViewer = new videoViewer ();
                break;
            case 'img' :
                break;
        }
    }


    openFile (_url) {

        this.mViewerLoader.openFile (_url);
        this.initViewer ();

        this.onopen (this.mViewerLoader.getType());
    }

    closeFile () {
        this.mViewerLoader.closeFile ();
        this.currentViewer = null;

        this.onclose ();
    }

    syncViewer () {

    }


    updateViewer (_data) {

        if(null == this.currentViewer)  return;

        const cmd = _data.cmd;
        switch(cmd)
        {
            case 'open' :
                const url = _data.url;
                classroomInfo.viewer.url = url;
                classroomInfo.viewer.state = true;               
                this.openFile (url);
                break;

            case 'close' :                
                classroomInfo.viewer.state = false;
                this.closeFile ();
                break;
            default :
                this.currentViewer.update (_data);
                break;
        }
    }

    onShowPage (_page) {
        this.currentViewer.setPage(_page);
    }

    onLoadedViewer () {
        this.onloaded (this.mViewerLoader.getType());
    } 
}


/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////


var mfileViewer = new fileViewerInfo ();

mfileViewer.onopen = function (_type) {
    console.log('open ' + _type);
    switch(_type)
    {
        case 'pdf' :
            initPdf ();
            break;
        case 'video' :
            break;
    }

    function initPdf () {

        mfileViewer.getCurrentViewer().onpage = (page) => {
            if(connection.extra.roomOwner) {

                // page change                
                // send to student
                connection.send ({
                    viewer : {
                        cmd : 'page',
                        page : page                        
                    }
                });
            }
            console.log('chnage page ' + page);
        }
    }
}

mfileViewer.onclose = function () {
    console.log('close');
}

mfileViewer.onloaded = function (_type) {

    switch(_type) {
        case 'pdf' :            
                mfileViewer.getCurrentViewer().showPage(classroomInfo.pdf.page);
            break;
        case 'video' :
            break;
    }   
}
