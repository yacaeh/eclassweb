var limitWidth = 700;

mobileHelper = {

    Init : function(){
        if(document.body.getBoundingClientRect().width < limitWidth){
            MainCamSetting();
            FullScreenBtnInit();
            ToolSetting();
        }
    },

    FullScreenOn : function(){

    }


}

function ToolSetting(){
    var doc = document.getElementById('widget-container').getElementsByTagName('iframe')[0].
    contentWindow.document;
    doc.getElementById("tool-box").removeChild(doc.getElementsByClassName("tooldivide")[0])
    doc.getElementById("tool-box").removeChild(doc.getElementById("screen_share"))
    doc.getElementById("tool-box").removeChild(doc.getElementById("textIcon"))
    doc.getElementById("tool-box").removeChild(doc.getElementById("clearCanvas"))
    doc.getElementById("tool-box").removeChild(doc.getElementById("undo"))
}

function MainCamSetting(){
    var video = document.getElementById("main-video");
    var x = 0;
    var y = 0;
    var lastleft = 0;
    var lastright =0 ;


    video.controls = false;
    var timeout = null;

    addEvent(video, "touchstart mousedown", function(e){
        if(timeout != null){
            clearTimeout(timeout);
            timeout = null;
            if(!video.classList.contains("full")){
                lastleft = video.style.left;
                lastright = video.style.right;

                video.style.width = "calc(100% - 50px)";
                video.style.height = "calc(100% - 25px)";
                video.style.left = "50px";
                video.style.top = "0px";
                video.classList.add("full");
                return false;
            }
            else{
                video.style.width = "20%";
                video.style.height = "calc(100% - 25px)";
                video.style.left = lastleft;
                video.style.top = lastright;
                video.classList.remove("full");
                return false;
            }
        }
        
        if(!video.classList.contains("full")){
            if(e.touches){
                e = TouchConverter(e);
            }
            x = e.pageX;
            y = e.pageY;
        }

        timeout = setTimeout(function(){
            timeout = null;
        }, 300);

        preventStopEvent(e);
    })
    addEvent(video, "touchmove mousemove", function(e){

        if(video.classList.contains("full"))
            return false;
            
        if(e.touches){
            e = TouchConverter(e);
        }
        x -= e.pageX;
        y -= e.pageY;
        video.style.left = video.getBoundingClientRect().left - x + "px";  
        video.style.top = video.getBoundingClientRect().top - y  + "px";  
        x = e.pageX;
        y = e.pageY;

        preventStopEvent(e);
    })

    addEvent(video, 'touchend mouseup', function(e) {
        preventStopEvent(e);
    })

    AppendInFrame(video);
}

function TouchConverter(e){
    var r = {
        pageX : e.touches[0].pageX,
        pageY : e.touches[0].pageY,
    }   
    return r;

}

function preventStopEvent(e) {
    if (!e) {
        return;
    }

    if (typeof e.preventDefault === 'function') {
        e.preventDefault();
    }

    if (typeof e.stopPropagation === 'function') {
        e.stopPropagation();
    }
}

function FullScreenBtnInit() {
    this.needHelp = true;

    var doc = document.getElementById('widget-container').getElementsByTagName('iframe')[0].
    contentWindow.document;
    

    var btn = doc.getElementById("full");
    btn.className = "fullscreen";
    btn.classList.add("off");            
    btn.style.display = 'block';
    var context = btn.getContext('2d');
    var image = new Image();

    image.onload = function() {
        context.clearRect(0, 0, 28, 28);
        context.drawImage(image, 0, 0, 28, 28);
    };

    btn.addEventListener('click' ,function(){
        if(btn.classList.contains("off")){
            document.getElementById("widget-container").requestFullscreen();
            doc.getElementById("tool-box").style.height = "calc(100% - 10px)";
            image.src = "/dashboard/img/cam_min.png";
        }
        else{
            document.exitFullscreen();
            doc.getElementById("tool-box").style.height = "calc(100% - 60px)";
            image.src = "/dashboard/img/cam_max.png";
        }
        btn.classList.toggle("off");
        btn.classList.toggle("on");
    })

    // AppendInFrame(btn);
}

function AppendInFrame(element){
    document.getElementById('widget-container').getElementsByTagName('iframe')[0].
    contentWindow.document.body.appendChild(element);
}

function addEvent(element, eventType, callback) {
    if (eventType.split(' ').length > 1) {
        var events = eventType.split(' ');
        for (var i = 0; i < events.length; i++) {
            addEvent(element, events[i], callback);
        }
        return;
    }

    if (element.addEventListener) {
        element.addEventListener(eventType, callback, !1);
        return true;
    } else if (element.attachEvent) {
        return element.attachEvent('on' + eventType, callback);
    } else {
        element['on' + eventType] = callback;
    }
    return this;
}