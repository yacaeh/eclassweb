class mobileHelperClass {
    constructor() {
        this.isMobile = false;
        this.conversationPanel;
    }
    init() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            // || !connection.extra.roomOwner
        ) {
            this.conversationPanel = document.getElementById('conversation-panel');
            this.setMobile();
        }
    }
    setMobile() {
        this.isMobile = true;
        widgetContainer.style.right = "0px";
        ChatSetting();
        FullScreenBtnInit();
        ToolSetting();
        rightTab.style.display = "none";
        rightTab.style.width = "0px";
        classroomManager.canvasResize();
        MainCamSetting();

        function ToolSetting() {
            let doc = GetDoc();
            let toolbox = doc.getElementById("tool-box");
            toolbox.removeChild(doc.getElementsByClassName("tooldivide")[0])
            toolbox.removeChild(doc.getElementById("screen_share"))
            toolbox.removeChild(doc.getElementById("textIcon"))
            toolbox.removeChild(doc.getElementById("clearCanvas"))
            toolbox.removeChild(doc.getElementById("undo"))
        }

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
                        let rect = GetDoc().body.getBoundingClientRect();
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
                    else {
                        video.style.height = "";
                        video.style.width = "20%";
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

                if (left < 0 || top < 0)
                    return false;

                let canvaswidth = GetDoc().body.getBoundingClientRect().width;
                let canvasheight = GetDoc().body.getBoundingClientRect().height;

                if (left + rect.width > canvaswidth ||
                    top + rect.height > canvasheight
                )
                    return false;

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

            maincamManager.start(function () {
                AppendInFrame(video);
            });
        }

        function FullScreenBtnInit() {
            let doc = GetDoc();
            let btn = doc.getElementById("full");
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
            let widget = widgetContainer;
            let chatinput = document.getElementsByClassName("emojionearea-inline")[0]
            console.log(chatinput);
            console.log(widget.firstChild);
            console.log(widget);
            widget.insertBefore(chatinput, widget.firstChild)
            AppendInFrame(mobileHelper.conversationPanel);
            let div = document.createElement("div");
            div.className = "chatonoff";

            let img = document.createElement("img");
            img.src = "/dashboard/img/openchat.png";
            div.appendChild(img);

            widget.insertBefore(div, widget.firstChild)

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