

/*
    pdf, video, audio, jpg .. 등등
*/

class pdfViewer {
    state;
    page;
}

class videoViewer {
    state;
    time;
}

class fileViewerInfo {

    bOpen = false;
    type = 'none';
    url = '';

    pdf = new pdfViewer();    

    constructor () {

    }

    setOpenState (_open = Boolean) {
        this.bOpen = _open;
    }

    setUrl (_url = String) {
        this.url = _url
    }

    setType (_type = String) {
        console.log('setType ' + _type);
        this.type = _type;
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

    getFileNameToExtention (_fileName) {
        return _fileName.substr(_fileName.lastIndexOf('.') + 1);
    }

   
    initViewer () {
        switch(this.type){
            case 'pdf' :
                break;
            case 'mp4' :
                break;
            case 'jpg' :
                break;
        }
    }

    openFile (_url) {

        if(this.IsOpen()) {
            this.closeFile ();
        }            

        this.setOpenState(true);
        this.setUrl (_url);
        this.setType(this.getFileNameToExtention (_url));
        this.initViewer ();

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

}
