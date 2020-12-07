class mobileHelperClass {
    constructor() {
        this.conversationPanel;
    }
    init() {
        if (store.getState().isMobile) {
            this.conversationPanel = document.getElementById('conversation-panel');
            this.setMobile();
        }
    }
    setMobile() {
        ChatSetting();
        FullScreenBtnInit();
        widgetContainer.style.right = "0px";
        rightTab.style.opacity = 0;
        classroomManager.canvasResize();
        MainCamSetting();

        function MainCamSetting() {
            let video = maincamManager.get();
            let x = 0;
            let y = 0;
            let lastleft = 0;
            let lastTop = 0;
            video.controls = false;
            let timeout = null;
            let isTouch = false;

            addEvent(video, "touchstart mousedown", function (e) {
                if (timeout != null) {
                    clearTimeout(timeout);
                    timeout = null;
                    if (!video.classList.contains("full")) {
                        lastleft = video.style.left;
                        lastTop = video.style.top;
                        video.style.width = "100%";
                        video.style.height = "100%";
                        video.style.top = "0px";
                        video.classList.add("full");
                        return false;
                    }
                    else {
                        video.style.height = "";
                        video.style.width = "50%";
                        video.style.left = lastleft;
                        video.style.top = lastTop;
                        video.classList.remove("full");
                        return false;
                    }
                }

                if (!video.classList.contains("full")) {
                    if (e.touches) {
                        e = TouchConverter(e);
                    }
                    isTouch = true;
                    x = e.pageX;
                    y = e.pageY;
                }

                timeout = setTimeout(function () {
                    timeout = null;
                }, 300);

                preventStopEvent(e);
            })
            addEvent(video, "touchmove mousemove", function (e) {

                if (video.classList.contains("full") || !isTouch)
                    return false;

                if (e.touches) {
                    e = TouchConverter(e);
                }
                x -= e.pageX;
                y -= e.pageY;

                let rect = video.getBoundingClientRect();
                let left = rect.left - x;
                let top = rect.top - y;

                x = e.pageX;
                y = e.pageY;

                let canvaswidth = document.getElementById('canvas-div').getBoundingClientRect().width;
                let canvasheight = document.getElementById('canvas-div').getBoundingClientRect().height;

                left = Math.min(Math.max(0, x - rect.width), canvaswidth - rect.width);
                top = Math.min(Math.max(0, y - rect.height), canvasheight - rect.height);

                video.style.left = left + "px";
                video.style.top = top + "px";
                preventStopEvent(e);
            })
            addEvent(video, 'touchend mouseup', function (e) {
                isTouch = false;
                preventStopEvent(e);

            })

            window.addEventListener("orientationchange", function (e) {
                setTimeout(function () {
                    let canvaswidth = GetDoc().body.getBoundingClientRect().width;
                    let canvasheight = GetDoc().body.getBoundingClientRect().height;
                    let rect = video.getBoundingClientRect();

                    let x = rect.x + rect.width;
                    let y = rect.y + rect.height;
                    if (x > canvaswidth) {
                        video.style.left = canvaswidth - rect.width + "px";
                    }
                    if (y > canvasheight) {
                        video.style.top = canvasheight - rect.height + "px";
                    }
                }, 1000)

            })

            // setTimeout(() => {
            //     AppendInFrame(video);
            // },5000)
            
        }

        function FullScreenBtnInit() {
            let btn = document.getElementById("full");
            btn.classList.add("fullscreen");
            btn.classList.add("off");
            btn.style.display = 'block';
            let context = btn.getContext('2d');
            let image = new Image();

            image.onload = function () {
                context.clearRect(0, 0, 28, 28);
                context.drawImage(image, 0, 0, 28, 28);
            };

            btn.addEventListener('click', function () {

                if (btn.classList.contains("off")) {
                    var promise = widgetContainer.requestFullscreen();
                    image.src = "/dashboard/img/cam_min.png";
                }
                else {
                    var promise = document.exitFullscreen();
                    image.src = "/dashboard/img/cam_max.png";
                }

                promise.then(function () {
                    classroomManager.canvasResize();
                })
                btn.classList.toggle("off");
                btn.classList.toggle("on");

            })

        }

        function TouchConverter(e) {
            let r = {
                pageX: e.touches[0].pageX,
                pageY: e.touches[0].pageY,
            }
            return r;
        }
        function preventStopEvent(e) {
            if (!e) {
                return;
            }

            if (typeof e.preventDefault === 'function') {
                if(e.cancleable)
                e.preventDefault();
            }

            if (typeof e.stopPropagation === 'function') {
                e.stopPropagation();
            }
        }

        function AppendInFrame(element) {
            GetWidgetFrame().document.body.appendChild(element);
        }

        function addEvent(element, eventType, callback) {
            if (eventType.split(' ').length > 1) {
                let events = eventType.split(' ');
                for (let i = 0; i < events.length; i++) {
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

        function GetDoc() {
            return GetWidgetFrame().document;
        }
        function ChatSetting() {
            let chatinput = document.getElementById("txt-chat-message");
            widgetContainer.insertBefore(chatinput, widgetContainer.firstChild)
            AppendInFrame(mobileHelper.conversationPanel);
            let div = document.createElement("div");
            div.className = "chatonoff";

            let img = document.createElement("img");
            img.src = "/dashboard/img/openchat.png";
            div.appendChild(img);

            widgetContainer.insertBefore(div, widgetContainer.firstChild)

            div.addEventListener("click", function () {
                this.classList.toggle("off");

                if (this.classList.contains("off")) {
                    $(mobileHelper.conversationPanel).hide("Blind");
                    $(chatinput).hide("Fade");
                    div.style.transform = "rotate(90deg)";
                }
                else {
                    div.style.transform = "rotate(-90deg)";
                    $(mobileHelper.conversationPanel).show("Blind");
                    $(chatinput).show("Fade");
                }
            })
        }
    }
}