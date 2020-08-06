var limitWidth = 700;
var isMobile = false;



mobileHelper = {
    Init : function(){
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        // || !connection.extra.roomOwner
        ) {
            SetMobile();
        }
    },
}

function SetMobile(){
    isMobile = true;
    document.getElementById("widget-container").style.right = "0px";
    ChatSetting();
    FullScreenBtnInit();
    ToolSetting();
    $(".right-tab").css({display:"none", width : "0px"})
    CanvasResize();
    MainCamSetting();
}

function ToolSetting(){
    var doc = GetDoc();
    doc.getElementById("tool-box").removeChild(doc.getElementsByClassName("tooldivide")[0])
    doc.getElementById("tool-box").removeChild(doc.getElementById("screen_share"))
    doc.getElementById("tool-box").removeChild(doc.getElementById("textIcon"))
    doc.getElementById("tool-box").removeChild(doc.getElementById("clearCanvas"))
    doc.getElementById("tool-box").removeChild(doc.getElementById("undo"))
    // doc.getElementById("tool-box").removeChild(doc.getElementById("homework"))
}

function MainCamSetting(){
    var video = GetMainVideo();
    var x = 0;
    var y = 0;
    var lastleft = 0;
    var lastTop =0 ;
    video.controls = false;
    var timeout = null;
    var isTouch = false;

    addEvent(video, "touchstart mousedown", function(e){
        if(timeout != null){
            clearTimeout(timeout);
            timeout = null;
            if(!video.classList.contains("full")){
                var rect = GetDoc().body.getBoundingClientRect();
                console.log(rect);

                lastleft = video.style.left;
                lastTop = video.style.top;

                video.style.width = "100%";
                video.style.height = "100%";
                video.style.left = "50px";
                video.style.top = "0px";
                video.classList.add("full");
                return false;
            }
            else{
                video.style.height = "";
                video.style.width = "20%";
                video.style.left = lastleft;
                video.style.top = lastTop;
                video.classList.remove("full");
                return false;
            }
        }
        
        if(!video.classList.contains("full")){
            if(e.touches){
                e = TouchConverter(e);
            }
            isTouch = true;
            x = e.pageX;
            y = e.pageY;
        }

        timeout = setTimeout(function(){
            timeout = null;
        }, 300);

        preventStopEvent(e);
    })
    addEvent(video, "touchmove mousemove", function(e){

        if(video.classList.contains("full") || !isTouch)
            return false;

        if(e.touches){
            e = TouchConverter(e);
        }
        x -= e.pageX;
        y -= e.pageY;

        var rect = video.getBoundingClientRect();
        var left = rect.left - x;
        var top = rect.top - y;

        x = e.pageX;
        y = e.pageY;

        if(left < 0 || top < 0)
            return false;

        var canvaswidth = GetDoc().body.getBoundingClientRect().width;
        var canvasheight = GetDoc().body.getBoundingClientRect().height;

        if(left + rect.width > canvaswidth ||
            top + rect.height > canvasheight
            )
            return false;

        video.style.left = left + "px";  
        video.style.top =  top + "px";  


        preventStopEvent(e);
    })
    addEvent(video, 'touchend mouseup', function(e) {
        isTouch = false;
        preventStopEvent(e);

    })

    window.addEventListener("orientationchange", function(e){
        setTimeout(function(){
            var canvaswidth = GetDoc().body.getBoundingClientRect().width;
            var canvasheight = GetDoc().body.getBoundingClientRect().height;
            var rect = video.getBoundingClientRect();

            var x = rect.x + rect.width;
            var y = rect.y + rect.height; 
            if(x > canvaswidth){
                video.style.left = canvaswidth - rect.width + "px";
            }
            if(y > canvasheight){
                video.style.top = canvasheight - rect.height + "px";
            }
        }, 1000)

    })

    var i = setInterval(function(){
        if(video.srcObject){
            AppendInFrame(video);
            video.muted = "muted"
            video.play();
            clearInterval(i)
        }
    }, 500)
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

    var doc = GetDoc();
    console.log(doc)
    var btn = doc.getElementById("full");
    console.log(btn);
    btn.classList.add("fullscreen");
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
            var promise = document.getElementById("widget-container").requestFullscreen();
            image.src = "/dashboard/img/cam_min.png";
        }
        else{
            var promise = document.exitFullscreen();

            image.src = "/dashboard/img/cam_max.png";
        }

        promise.then(function(){
            CanvasResize();
        })
        btn.classList.toggle("off");
        btn.classList.toggle("on");

    })

    // AppendInFrame(btn);
}

function AppendInFrame(element){
    GetWidgetFrame().document.body.appendChild(element);
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

function GetDoc(){
    return document.getElementById('widget-container').getElementsByTagName('iframe')[0].
    contentWindow.document;
}

function ChatSetting(){
    var widget = document.getElementById("widget-container");
    var chatinput = document.getElementsByClassName("emojionearea-inline")[0]
    widget.insertBefore( chatinput ,widget.firstChild)
    AppendInFrame(conversationPanel);
    var div = document.createElement("div");
    div.className = "chatonoff";

    var img = document.createElement("img");
    img.src = "/dashboard/img/openchat.png";
    div.appendChild(img);

    widget.insertBefore(div,widget.firstChild)

    div.addEventListener("click", function(){
        this.classList.toggle("off");

        if(this.classList.contains("off")){
            $(conversationPanel).hide("Blind");
            $(chatinput).hide("Fade");
            div.style.transform = "rotate(90deg)";
        }
        else{
            div.style.transform = "rotate(-90deg)";
            $(conversationPanel).show("Blind");
            $(chatinput).show("Fade");
        }
    })
}