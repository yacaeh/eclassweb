var limitWidth = 700;

mobileHelper = {

    Init : function(){
        if(document.body.getBoundingClientRect().width < limitWidth){
            MainCamSetting();
            FullScreenBtnInit();
        }
    },

    FullScreenOn : function(){

    }


}

function MainCamSetting(){
    var video = document.getElementById("main-video");
    var x = 0;
    var y = 0;

    video.controls = false;
    
    addEvent(video, "click touchstart", function(e){
        if(e.touches){
            e = TouchConverter(e);
        }
        x = e.pageX;
        y = e.pageY;
    })
    addEvent(video, "touchmove mousemove", function(e){
        if(e.touches){
            e = TouchConverter(e);
        }
        x -= e.pageX;
        y -= e.pageY;
        video.style.left = video.getBoundingClientRect().left - x + "px";  
        video.style.top = video.getBoundingClientRect().top - y  + "px";  
        x = e.pageX;
        y = e.pageY;
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

function FullScreenBtnInit() {
    this.needHelp = true;

    var btn = document.createElement("button");
    btn.className = "fullscreen";
    btn.innerHTML = "전체화면";
    btn.classList.add("off");            

    btn.addEventListener('click' ,function(){
        if(btn.classList.contains("off")){
            document.getElementById("widget-container").requestFullscreen();
            btn.innerHTML = "돌아가기";
            btn.style.bottom = "5px";
        }
        else{
            document.exitFullscreen();
            btn.innerHTML = "전체화면";
            btn.style.bottom = "55px";
        }
        btn.classList.toggle("off");
        btn.classList.toggle("on");
    })

    AppendInFrame(btn);
}

function AppendInFrame(element){
    document.getElementById('widget-container').getElementsByTagName('iframe')[0].contentWindow.document.body.appendChild(element);
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