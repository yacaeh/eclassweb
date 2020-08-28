// Last time updated: 2018-12-24 8:45:05 AM UTC

// _______________
// Canvas-Designer

// https://github.com/muaz-khan/Canvas-Designer

'use strict';

const penFont = new FontFace('나눔펜글씨', 'url(/dashboard/css/NanumPen.ttf)');
penFont.load().then((font) => {
  document.fonts.add(font);
});

const gothicFont = new FontFace('나눔고딕', 'url(/dashboard/css/NanumBarunGothic.ttf)');
gothicFont.load().then((font) => {
  document.fonts.add(font);
});

(function() {
    var teacherPoints = [];
    var studentPoints = {};
    var pointHistory = [];
    var markerpoint = [];

    document.addEventListener("click", function(){
        window.focus();
    });


    var is = {
        isLine: false,
        isArc: false,
        isPencil: false,
        isMarker: true,
        isEraser: false,
        isText: false,
        screenShare : false,
        view3d : false,

        set: function(shape) {
            let cache = this;
            cache.isLine = cache.isPencil = cache.isMarker = cache.isEraser = cache.isText = false;
            cache['is' + shape] = true;
        }
    };

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

    function find(selector) {
        return document.getElementById(selector);
    }

    var points = [],
        lineWidth = 2,
        strokeStyle = '#6c96c8',
        fillStyle = '#484848',
        globalAlpha = 1,
        font = '500px "나눔펜글씨"';

    function getContext(id) {
        var canv = find(id),
            ctx = canv.getContext('2d');
            canv.setAttribute('width', innerWidth - 50);
            canv.setAttribute('height', innerHeight);
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = strokeStyle;
            ctx.fillStyle = fillStyle;
            ctx.font = font;
        return ctx;
    }
   
function normalizePoint (x, y) {
    return [x / canvas.width, y / canvas.height];
}

function resizePoint (point) {
    const p0 = canvas.width * point[0];
    const p1 = canvas.height * point[1];
    return [p0, p1];
}

window.resize = function(){
    canvasresize('main-canvas');
    canvasresize('temp-canvas');
    drawHelper.redraw();
}

function canvasresize(id){
    var canv = find(id);
    if(!canv)
        return;
    canv.setAttribute('width', innerWidth - 50);
    canv.setAttribute('height', innerHeight);
}

    var context = getContext('main-canvas'),
        tempContext = getContext('temp-canvas');


    var common = {
        updateTextArea: function() {
            var c = common;
        },
        toFixed: function(input) {
            return Number(input).toFixed(1);
        },

    };


    function endLastPath() {
        drawHelper.redraw();

        if (textHandler.text && textHandler.text.length) {
            textHandler.appendPoints();
            textHandler.onShapeUnSelected();
        }
        textHandler.showOrHideTextTools('hide');
    }

    // marker + pencil
    function hexToR(h) {
        return parseInt((cutHex(h)).substring(0, 2), 16)
    }

    function hexToG(h) {
        return parseInt((cutHex(h)).substring(2, 4), 16)
    }

    function hexToB(h) {
        return parseInt((cutHex(h)).substring(4, 6), 16)
    }

    function cutHex(h) {
        return (h.charAt(0) == "#") ? h.substring(1, 7) : h
    }

    function clone(obj) {
        if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
            return obj;

        if (obj instanceof Date)
            var temp = new obj.constructor(); //or new Date(obj);
        else
            var temp = obj.constructor();

        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                obj['isActiveClone'] = null;
                temp[key] = clone(obj[key]);
                delete obj['isActiveClone'];
            }
        }

        return temp;
    }

    function hexToRGB(h) {
        return [
            hexToR(h),
            hexToG(h),
            hexToB(h)
        ]
    }


    var drawHelper = {
        firstTime : false,
        prepoint : [],
        marking : false,

        redraw: function() {
            tempContext.clearRect(0, 0, innerWidth, innerHeight);
            context.clearRect(0, 0, innerWidth, innerHeight);

            context.lineCap = "round";
            context.lineJoin = "round";

            var _this = this;
            
            Object.keys(studentPoints).forEach(function(e){
                studentPoints[e].forEach(function(data){
                    drawpoint(data.points);
                })
            })

            teacherPoints.forEach(function(data){
                drawpoint(data.points);
            })

            drawpoint(points);

            function drawpoint(points) {
                points.forEach(function (point) {
                    if (point == null) {
                        return false;
                    }

                    if (point[0] == "marker") {

                        if (!_this.marking) {
                            context.beginPath();

                            let opt = point[2];
                            context.lineWidth = opt[0];
                            context.strokeStyle = opt[1];
                            _this.marking = true;
                        }
                    
                        if(point[1][0] == -1){
                            context.stroke();
                            _this.marking = false;
                            _this.prepoint = [];
                            return;
                        }

                        const resizeP = resizePoint(point[1]);

                        if(!_this.prepoint) _this.prepoint = [resizeP[0], resizeP[1]];
                        if (_this.prepoint[0] == resizeP[0] && _this.prepoint[1] == resizeP[1]) {
                            context.beginPath();
                        }

                        context.moveTo(_this.prepoint[0], _this.prepoint[1]);
                        context.lineTo(resizeP[0], resizeP[1]);
                        _this.prepoint = [resizeP[0], resizeP[1]];
                    }
                    else {
                        if (_this.marking) {
                            _this.marking = !_this.marking;
                            context.stroke();
                        }
    
                        if (point && point.length && _this[point[0]]) {
                            context.beginPath();
                            _this[point[0]](context, point[1], point[2]);
                        }
                    }

                });

                if (_this.marking) {
                    _this.marking = !_this.marking;
                    context.stroke();
                }

                if(!_this.firstTime){
                    _this.firstTime = true;
                    drawpoint(points);
                }
                _this.prepoint = [];

            }
        },

        getOptions: function(opt) {
            opt = opt || {};
            return [
                opt.lineWidth || lineWidth,
                opt.strokeStyle || strokeStyle,
                opt.fillStyle || fillStyle,
                opt.globalAlpha || globalAlpha,
                opt.font || font
            ];
        },
        handleOptions: function(context, opt, isNoFillStroke) {
            opt = opt || this.getOptions();

            context.lineWidth = opt[0];
            context.strokeStyle = opt[1];
            context.fillStyle = opt[2];
            context.globalAlpha = opt[3];

            if (!isNoFillStroke) {
                context.stroke();
                context.fill();
            }
        },
        line: function(context, point, options) {
            if(point[0] == -1){
                context.beginPath();
                this.prepoint = [];
                return;
            }

            const p = resizePoint(point);
            context.beginPath();

            let x, y;

            x = this.prepoint[0] || p[0];
            y = this.prepoint[1] || p[1];

            context.moveTo(x, y);
            context.lineTo(p[0], p[1]);
            
            this.prepoint[0] = p[0];
            this.prepoint[1] = p[1];

            this.handleOptions(context, options);
        },
        marker: function(context, point, options) {
            context.beginPath();
            context.clearRect(0,0,innerWidth, innerHeight)

            let pre = [];
            for(let i = 0 ; i < point.length; i++){
                let p = point[i];
                let x, y;
                x = pre[0] || p[0];
                y = pre[1] || p[1];
                context.moveTo(x, y);
                context.lineTo(p[0], p[1]);
                pre[0] = p[0];
                pre[1] = p[1];
            }
            this.handleOptions(context, options);
        },
        text: function(context, point, options) {
            const normal = resizePoint( [point[1], point[2]]);
            this.handleOptions(context, options);
            context.font = options[4];
            context.fillStyle = textHandler.getFillColor(options[2]);
            context.fillText(point[0].substr(1, point[0].length - 2), normal[0], normal[1]);
        },
    };

    var pencilHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            // normlaize : 0 ~ 1
            const normalized = normalizePoint (x, y);
            let nx = normalized[0];
            let ny = normalized[1];

            t.prevX = nx;
            t.prevY = ny;

            t.ismousedown = true;

            tempContext.lineCap = 'round';
            let opt = pencilDrawHelper.getOptions();
            pencilDrawHelper.line(tempContext, [t.prevX, t.prevY], opt, [x,y]);
            points[points.length] = ['line', [t.prevX, t.prevY], opt];   
            document.getElementById("pencil-container").style.display = 'none';
        },
        mouseup: function(e) {        
            points[points.length] = ['line', [-1, -1]];
            pointHistory.push(points.length);
            this.ismousedown = false;
        },
        mousemove: function(e) {
            let x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            // normalize~
            const normalized = normalizePoint(x, y);
            let nx = normalized[0];
            let ny = normalized[1];

            let t = this;            

            if (t.ismousedown) {
                tempContext.lineCap = 'round';
                let opt = pencilDrawHelper.getOptions()
                pencilDrawHelper.line(tempContext, [t.prevX, t.prevY], opt , [x,y]);
                points[points.length] = ['line', [t.prevX, t.prevY], opt];
                t.prevX = nx;
                t.prevY = ny;
            }
        }
    }

    var pencilLineWidth = document.getElementById('pencil-stroke-style').value,
        pencilStrokeStyle = '#484848';

    var pencilDrawHelper = clone(drawHelper);

    pencilDrawHelper.getOptions = function() {
        return [pencilLineWidth, pencilStrokeStyle];
    }


    var markerHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function(e) {
            let x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            const normalized = normalizePoint(x, y);
            let nx = normalized[0];
            let ny = normalized[1];
            let t = this;
            t.prevX = nx;
            t.prevY = ny;
            t.ismousedown = true;
            tempContext.lineCap = 'round';
            markerpoint = [];
            markerpoint.push([x, y]);
            let opt = markerDrawHelper.getOptions();
            points[points.length] = ['marker', [t.prevX, t.prevY], opt];

            document.getElementById("marker-container").style.display = 'none';
        },
        mouseup: function(e) {
            points[points.length] = ['marker', [-1, -1]];
            pointHistory.push(points.length);
            this.ismousedown = false;
        },
        mousemove: function(e) {
            let x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            let t = this;

            const normalized = normalizePoint(x, y);
            let nx = normalized[0];
            let ny = normalized[1];

            if (t.ismousedown) {
                tempContext.lineCap = 'round';
             
                markerpoint.push([x, y]);
                let opt = markerDrawHelper.getOptions();
                markerDrawHelper.marker(tempContext, markerpoint, opt, []);
                points[points.length] = ['marker', [t.prevX, t.prevY], opt];
                t.prevX = nx;
                t.prevY = ny;
            }
        }
    }

    var markerLineWidth = document.getElementById('marker-stroke-style').value,
        markerStrokeStyle = '#F12A2A';

    var markerDrawHelper = clone(drawHelper);

    markerDrawHelper.getOptions = function() {
        return [markerLineWidth, markerStrokeStyle];
    }

    function isNear(x,y, point){
        let px = point[0]
        let py = point[1]

        let dist = Math.pow(x - px,2) + Math.pow(y - py,2);
        if(dist < 0.0005)
            return true;
        else return false;
    }

    var eraserHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,

        mousedown: function(e) {

            let x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;
            let t = this;
            t.ismousedown = true;
            const normalized = normalizePoint(x, y);
            x =normalized[0];
            y =normalized[1];
            t.prevX = x;
            t.prevY = y;
            this.eraser(x,y);
        },
        mouseup: function(e) {
            this.ismousedown = false;
        },
        mousemove: function(e) {
            let x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            let t = this;

            const normalized = normalizePoint(x, y);
            x = normalized[0];
            y = normalized[1];

            if (t.ismousedown) {
                this.eraser(x,y)
            }
        },
        eraser(x,y){
            let pre = undefined;
            let _idx = undefined;
            let near = undefined;

            points.forEach(function(point,idx){
                try{
                    if(point[0] == "text"){
                        // const normalize = normalizePoint(point[1][1], point[1][2])
                        let tempPoint = [point[1][1], point[1][2]];
                        near = isNear(x,y,tempPoint);
                    }
                    else{
                        near = isNear(x,y,point[1]);
                    }
                }   
                catch{
                    console.error(points);
                }

                if(near){
                    for(let i = 0 ; i < pointHistory.length; i++){
                        if(idx < pointHistory[i]){
    
                            if(i == 0)
                                pre = 0;
                            else 
                                pre = pointHistory[i-1];
    
                            _idx = i ;

                            let numofpoint = pointHistory[i] - pre
                            points.splice(pre, numofpoint);
                            pointHistory.splice(i,1);
                            for(let z = i ; z < pointHistory.length; z++){
                                pointHistory[z] -= numofpoint;
                            }
                            lastPointIndex = points.length;

                            window.parent.currentPoints = points;
                            window.parent.currentHistory = pointHistory;
                            
                            if(_idx != undefined){
                                let data = {
                                    points : [],
                                    history : pointHistory,
                                    command : "eraser",
                                    idx : _idx,
                                    userid : _uid,

                                }
                                
                                // console.log("SEND ERASER",_uid, data);
                                data.pageidx = window.parent.pointer_saver.nowIdx;
                                window.parent.postMessage({
                                    canvasDesignerSyncData: data,
                                    uid: uid
                                }, '*');
                            }

                            drawHelper.redraw();
                            break;
                        }
                    }
                }
            });
        }
    };

    var textHandler = {
        text: '',
        selectedFontFamily: '나눔펜글씨',
        selectedFontSize: '48',
        lastFillStyle: 'black',
        onShapeSelected: function() {
            document.getElementById("temp-canvas").className = "";
            document.getElementById("temp-canvas").classList.add("texti");
            this.x = this.y = this.pageX = this.pageY = 0;
            this.text = '';
        },
        onShapeUnSelected: function() {
            this.text = '';
            this.showOrHideTextTools('hide');
        },
        getFillColor: function(color) {
            color = (color || fillStyle).toLowerCase();

            if (color == 'rgba(255, 255, 255, 0)' || color == 'transparent' || color === 'white') {
                return 'black';
            }

            return color;
        },
        index: 0,
        getOptions: function() {
            let options = {
                font: textHandler.selectedFontSize + 'px ' + textHandler.selectedFontFamily + '',
                fillStyle: this.lastFillStyle,
                strokeStyle: '#6c96c8',
                globalAlpha: 1,
                lineWidth: 2
            };
            font = options.font;
            return options;
        },
        appendPoints: function() {
            let options = textHandler.getOptions();
            const normal = normalizePoint(textHandler.x, textHandler.y)
            points[points.length] = ['text', ['"' + textHandler.text + '"', normal[0], normal[1]], drawHelper.getOptions(options)];
            pointHistory.push(points.length);
            syncPoints(false, "text");
        },
        canvasInput:null,
        updateInput: function(){
            document.querySelector(".textInputUI").focus();
            document.querySelector(".textInputUI").addEventListener('change', (event) => {
                textHandler.text = event.target.value;
            });
        },
        mousedown: function(e) {
            //console.log("mouse down!");
            this.updateInput();
            if (!is.isText) return;

            if (textHandler.text.length) {
                this.appendPoints();
            }

            textHandler.x = textHandler.y = 0;
            textHandler.text = '';

            textHandler.pageX = e.pageX;
            textHandler.pageY = e.pageY;

            textHandler.x = e.pageX - canvas.offsetLeft - 5;
            textHandler.y = e.pageY - canvas.offsetTop + 10;

            this.showTextTools();
        },
        mousemove: function(e) {},
        showOrHideTextTools: function(show) {
            if (show === 'hide') {
                if (this.lastFillStyle.length) {
                    fillStyle = this.lastFillStyle;
                    this.lastFillStyle = '';
                }
            } else if (!this.lastFillStyle.length) {
                this.lastFillStyle = textHandler.lastFillStyle;
                //fillStyle = 'black';
            }
            
            this.textInputBox.style.display = show == 'show' ? 'block' : 'none';
            this.textInputBox.style.left = this.x + 'px';
            this.textInputBox.style.top = this.y -this.textInputBox.clientHeight + 'px';
            // this.textInputContainer.style.position = 'relative';

            this.fontColorBox.style.display = show == 'show' ? 'grid' : 'none';
            this.fontColorBox.style.left = this.x +'px';
            this.fontColorBox.style.top =  this.y - this.textInputBox.clientHeight - this.fontColorBox.clientHeight -10 +'px';

            this.fontFamilyBox.style.display = show == 'show' ? 'block' : 'none';
            this.fontSizeBox.style.display = show == 'show' ? 'block' : 'none';

            this.fontSizeBox.style.left = this.x + 'px';
            this.fontFamilyBox.style.left = (this.fontSizeBox.clientWidth + this.x) + 'px';

            this.fontSizeBox.style.top = this.y + 'px';
            this.fontFamilyBox.style.top = this.y + 'px';
        },
        showTextTools: function() {
            if (!this.fontFamilyBox || !this.fontSizeBox || !this.textInputBox || !this.fontColorBox) return;

            this.unselectAllFontFamilies();
            this.unselectAllFontSizes();

            this.showOrHideTextTools('show');

            this.eachFontFamily(function(child) {
                child.onclick = function(e) {
                    e.preventDefault();

                    textHandler.showOrHideTextTools('hide');

                    textHandler.selectedFontFamily = this.innerHTML;
                    this.className = 'font-family-selected';
                };
                child.style.fontFamily = child.innerHTML;
            });

            this.eachFontSize(function(child) {
                child.onclick = function(e) {
                    e.preventDefault();

                    textHandler.showOrHideTextTools('hide');

                    textHandler.selectedFontSize = this.innerHTML;
                    this.className = 'font-family-selected';
                };
                // child.style.fontSize = child.innerHTML + 'px';
            });
            this.eachFontColor(function(child) {
                child.onclick = function(e) {
                    e.preventDefault();

                    textHandler.showOrHideTextTools('hide');

                    textHandler.selectedFontColor = this.innerHTML;
                    this.className = 'font-color-selected';
                };
                // child.style.fontSize = child.innerHTML + 'px';
            });
            document.getElementsByClassName("textInputUI")[0].focus();

        },
        //textStrokeStyle : '#' + document.getElementById('text-fill-style').value,
        eachFontColor: function(callback){
            var container = document.getElementById('textInputContainer');
            var template = container.getElementsByClassName("color_template_text")[0];
            var divs = [];
            template.innerHTML = '';
            penColors.forEach(function(color){
                var div = document.createElement("div");
                div.dataset.color = color;
                div.className = "color";
                div.style.backgroundColor = color;
                divs.push(div);
                template.appendChild(div);
            });

            for(var i= 0 ; i < divs.length; i++){
                divs[i].addEventListener("click", function(){
                    var nowColor = this.dataset.color;
                    divs.forEach(element => element.classList.remove("on"));
                    this.classList.add("on");
                    textHandler.lastFillStyle = nowColor;
                })
            }
        },
        eachFontFamily: function(callback) {
            var childs = this.fontFamilyBox.querySelectorAll('li');
            for (var i = 0; i < childs.length; i++) {
                callback(childs[i]);
            }
        },
        unselectAllFontFamilies: function() {
            this.eachFontFamily(function(child) {
                child.className = '';
                if (child.innerHTML === textHandler.selectedFontFamily) {
                    child.className = 'font-family-selected';
                }
            });
        },
        eachFontSize: function(callback) {
            var childs = this.fontSizeBox.querySelectorAll('li');
            for (var i = 0; i < childs.length; i++) {
                callback(childs[i]);
            }
        },
        unselectAllFontSizes: function() {
            this.eachFontSize(function(child) {
                child.className = '';
                if (child.innerHTML === textHandler.selectedFontSize) {
                    child.className = 'font-size-selected';
                }
            });
        },
        onReturnKeyPressed: function() {
            //console.log(this.lastFillStyle);
            if (!textHandler.text || !textHandler.text.length) return;
            document.querySelector('.textInputUI').value = "";
            var fontSize = parseInt(textHandler.selectedFontSize) || 48;
            this.mousedown({
                pageX: this.pageX,
                // pageY: parseInt(tempContext.measureText(textHandler.text).height * 2) + 10
                pageY: this.pageY + fontSize + 5
            });
            drawHelper.redraw();
            this.showOrHideTextTools('hide');
        },
        textInputBox: document.querySelector('.textInputUI'),
        fontFamilyBox: document.querySelector('.fontSelectUl'),
        fontSizeBox: document.querySelector('.fontSizeUl'),
        fontColorBox: document.getElementById('textInputContainer').querySelector('.color_template_text'),
        textInputContainer:document.getElementById('textInputContainer')
    };

  
    var icons = {};
    if (params.icons) {
        try {
            icons = JSON.parse(params.icons);
        } catch (e) {
            icons = {};
        }
    }

    var data_uris = {
        line: icons.line || 'data:image/png;base64,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',
        pencilIcon: icons.pencil || 'data:image/png;base64,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',
        markerIcon: icons.marker || 'data:image/png;base64,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',
        eraserIcon: icons.eraser || 'data:image/png;base64,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',
        rectangle: icons.rectangle || 'data:image/png;base64,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',
        arc: icons.arc || 'data:image/png;base64,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',
        textIcon: icons.text || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAWVJREFUeJzt28ENgzAQAEETpf+WSQfJA6xD2ZkCjCWv7mFgLQAAAKDimN4A69y8/tczfm1+OA8ngDgBxAkgTgBxAogTQJx7gOf7dU9w6QxNgDgBxAkgTgBxAogTQJwA4t43rLH7ffa/G72LMQHiBBAngDgBxAkgTgBxAogTQJwA4gQQJ4A4AcQJIE4AcQKIu+N7gOl/C65+jzC9/1EmQJwA4gQQJ4A4AcQJIE4AcQKIE0CcAOIEECeAOAHECSBOAHECiBNAnADiBBAngDgBxAkgTgBxAogTQJwA4gQQJ4A4AcQJIE4AcQKIE0CcAOIEECeAOAHECSBOAHECiBNAnADiBBAngDgBxAkgTgBxAogTQJwA4gQQJ4A4AcQJIE4AcQKIE0CcAOIEECeAOAHECSBOAHECiBNAnADiBBAngDgBxAkgTgBxx/QGWOfm9b+esQkQJ4A4AcQJIE4AcQKIEwAAAABAxAcVTAXjELyg1wAAAABJRU5ErkJggg==',
        image: icons.image || 'data:image/png;base64,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',
        zoom_in: icons.zoom_in || 'data:image/png;base64,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',
        zoom_out: icons.zoom_out || 'data:image/png;base64,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',
        lineWidth: icons.lineWidth || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAABgUlEQVR4nO3csU0DMRgF4AdKoKFhGsa5YViCHTIIomEVGlJAAwWhoYAj57N98vdJr7XQ70jBlvMSAAAAAAAAAAAAAAAAYHsuCq93k+QuyW3hdfnykuQpyWvrP+SnfZL7JMckH7JqjqdZ72ftTAWXSQ5pP5jRcjjNvrkp7YcxaqYZ+7O6x7QfxKh5nLE/vyrxT+BbkqsC6/B/70mulyzQxXcI7ZT4ADwXWIPzLJ59iQ/AQ4E1OE8Xs3cMbJNujoFJsouLoFr5vgjazdqZP7gK3pZur4IBAAAAAAAAAACAtjwK3ZZuH4XqB6j/LFw/wODp5ochU9oPY9RMM/ZndfoB2kU/wOD0A7CMfoBt0w8wuC5m7xjYJt0cAxP9ADWjH2Bg3V4FAwAAAAAAAAAAAG15FLot3T4K1Q9Q/1m4foDB080PQ6a0H8aomWbsz+r0A7SLfoDB6QdgGf0A26YfYHBdzN4xsE26OQYm+gFqRj/AwLq9CgYAAAAAAAAAAAAAAABq+gRzFKdEQnj1fQAAAABJRU5ErkJggg==',
        colorsPicker: icons.colorsPicker || 'data:image/png;base64,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',
        undo: icons.undo || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABPxJREFUeNrsnVuIVVUYx9dpQiIdvOBtDGa8RILSQz4koWYvRZeXEkRztJd8ExGkSPBRSxDMB0ESxBBpSnyLMCGJChV6SSURpEkcZia8RjqpmTTT97HXYQYcZ87Za5+z917f7wd/BhT1eNZvfWutvdbeuzI0NOTALk/wFSAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAlBq9LyAkJeY5yWeSmabbz6gA70n6JX9LplkWwNoQME/yleSwZI7ktn6HzAFsoL3+R8kaBv5hnjTS63fR8DYrAL3eaAWg1xuuAPR6oxWAXm+4AtDrjVYA7fWfSNbSlPYqQLXX0/jGKgC93nAFoNcbrQD0esMVgF5vtALQ6w1XAHq90QqQR6//jwpgt9dXJE9LWqwKUAk91lWpVEI/Q4fkY0lnDv9/7f2/Sf5yyfEw/XlLck3SI+mT9PqfA0VswOD2y1mATt/4HQXuJPcl170oFyVnJeckl/zvIUDKsV4b/t2SVs5/Jb9Lzki+l/wg+aOMAuRxKniDL69DEUUrxDE/f5nWbAHKcix8ruTLyBp+tFyW7JY8jwDDrI+w14+Xu5IjkhctCzDPSK8fK/9IDrrkTiRTAmww2OvHii4tt/nrDlELoGP9FzT4Y6Mrh5diFaCTXl9T9KLShzEJMJexPlW6JDPKLsBGfxGEBk2XXyQL8xIgi82gQQchvCA5IVma27XkDIaADiZ+mawSXolhEniFxkydm5KVLANt56pkSQwXgqgG6dMtaY/hUjBzg/TR01ETY9kMWkc1SJW9sW0HUw3qiy6x34lFAOYG6aLf1eyYBGBuUH8OxCYAc4P6omcQl8UoQN5zg0G/M6enex8WXILv3Cj3cYS2XxHuCxh5gGRnrevfjPhT8qo/tTPJZ6pLnh/c7uXU4WqBZLrL/0aatyTHy34qeLxq0NXEXqWneVvH+UwtXoiXJZslR3M883DSJXczRTUEPG6l0Iwv+Ybv2fUyRfKGZJ9L7g9olgB6J9MKCwI0a26QVoCRTJa87ZL7AgaaIMEhKwJUWd/AlUIWAoxkkZ/HXG7wjmGbJQEaWQ2yFqCKHvPa6jd1GiHBRmsCNGpu0CgBqsxyydNL72UswNdWBci6GjRagCp6DPznDAXQW9jnWBUgy7lBswSorhz2ZyjBKusCZFENmilAlS2SBxkIsAcBwncY8xBAWe2G31eUNj/plUkECNthzEsA5U1/KTrkFPFMBAirBnkKoLwuuROwkbWc18Y9ilaBlX5PoejoDSHv++3euvfhXHL7fRCxvjSqx1eC6oMpioxeQv4g5Z99NvhfN/Dm0LFWCnkPASPZk2IY+Jw5QNjcoEgCTJB8W6cA3yBA2EqhSAIoz7j6NpJOI0D6atDnL8jMKNhne81PCmsR4FcESM98l7w+vq2An21HjQJ0I0A4RVwJPSU5VYMAvVwHCKeID7jQQ6qbXPIA67FoidF+SDjvkrME5sofDPOpS84RNKx6IUCx0aFgq1+tUAGMog+WPIAAttFl4ZVRfr2CADbQo+DbEcA2+iTW4whgF73w85HL+OVVCFAuLjh/GNQzIfQvLNLt4VAbrX4o0FfS9Ev7Lc5VACg3DAEIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgApeN/AQYAUjtq/Zx6jVYAAAAASUVORK5CYII=',

        clearCanvas: icons.clearCanvas || '',
        on : icons.on || '',
        off : icons.off || '',
        screenShare : icons.screenShare || '',
        view3d : icons.view3d || '',
        movie : icons.movie || '',
        file : icons.file,
        epub : icons.epub,
        callteacher : icons.callteacher,
        fulloff : icons.fulloff,
        fullon : icons.fullon,
        homework : icons.homework,
    };


    var tools = {
        line: true,
        pencil: true,
        marker: true,
        eraser: true,
        rectangle: true,
        arc: true,
        text: true,
        image: true,
        zoom: true,
        lineWidth: true,
        colorsPicker: true,
        code: true,
        
        clearCanvas: true,
        onoff: true,
        undo: true,
        screenShare: true
    };

    if (params.tools) {
        try {
            var t = JSON.parse(params.tools);
            tools = t;
        } catch (e) {}
    }

    if (tools.code === true) {
        document.querySelector('.preview-panel').style.display = 'block';
    }

    function setSelection(element, prop) {
        endLastPath();
        is.set(prop);
        var selected = document.getElementsByClassName('selected-shape')[0];
        if (selected) selected.className = selected.className.replace(/selected-shape/g, '');
        if (!element.className) {
            element.className = '';
        }
        element.className += ' selected-shape';
    }

    /* Default: setting default selected shape!! */
    is.set(window.selectedIcon);

    function setDefaultSelectedIcon() {
        let toolBox = document.getElementById('tool-box');
        let canvasElements = toolBox.getElementsByTagName('canvas');
        let shape = window.selectedIcon.toLowerCase();

        let firstMatch;
        for (let i = 0; i < canvasElements.length; i++) {
            if (!firstMatch && (canvasElements[i].id || '').indexOf(shape) !== -1) {
                firstMatch = canvasElements[i];
            }
        }
        if (!firstMatch) {
            window.selectedIcon = 'Pencil';
            firstMatch = document.getElementById('pencilIcon');
        }

        setSelection(firstMatch, window.selectedIcon);
    }

    window.addEventListener('load', function() {
        setDefaultSelectedIcon();
    }, false);

    (function() {
        var cache = {};

        function getContext(id) {
            var context = find(id).getContext('2d');
            context.lineWidth = 2;
            context.strokeStyle = '#6c96c8';
            return context;
        }

        function bindEvent(context, shape) {
            addEvent(context.canvas, 'click', function() {

                if (textHandler.text.length) {
                    textHandler.appendPoints();
                }

                if (shape === 'Text') {
                    if(this.classList.contains("off"))
                        return false;
                    textHandler.onShapeSelected();
                } else {
                    textHandler.onShapeUnSelected();
                }

                setSelection(this, shape);

                if (this.id === 'drag-last-path') {
                    find('copy-last').checked = true;
                    find('copy-all').checked = false;
                } else if (this.id === 'drag-all-paths') {
                    find('copy-all').checked = true;
                    find('copy-last').checked = false;
                }
         
                if (this.id === 'eraserIcon') {
                    if(this.classList.contains('off'))
                    return false;

                    document.getElementById("temp-canvas").className = "";
                    document.getElementById("temp-canvas").classList.add("eraser");
                    cache.strokeStyle = strokeStyle;
                    cache.fillStyle = fillStyle;
                    cache.lineWidth = lineWidth;

                    strokeStyle = 'White';
                    fillStyle = 'White';
                    lineWidth = 20;
                } else if (cache.strokeStyle && cache.fillStyle && typeof cache.lineWidth !== 'undefined') {
                    strokeStyle = cache.strokeStyle;
                    fillStyle = cache.fillStyle;
                    lineWidth = cache.lineWidth;
                }
            });
        }

        function decorateUndo() {
            var context = getContext('undo');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 0, 0, 28, 28);

                document.querySelector('#undo').onclick = function() {
                    if(this.classList.contains('off'))
                    return false;

                    if (points.length) {
                        let idx = pointHistory.length - 2;
                        idx == -1 ? points = [] : points.length = pointHistory[idx];
                        pointHistory.pop();
                        drawHelper.redraw();
                    }
                    syncPoints(true, "undo");
                };
            };
            image.src = data_uris.undo;
        }

        if (tools.undo === true) {
            decorateUndo();
            document.getElementById('undo').style.display = 'block';
        }


        function decorateFull() {
            var image = new Image();
            image.onload = () => {
                getContext('full').drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.fullon;
        }

        decorateFull();


        function decorate3dview() {
            var image = new Image();
            image.onload = () => {
                getContext('3d_view').drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.view3d;

            document.getElementById('3d_view').onclick = function() {
                this.classList.toggle("on");
                this.classList.toggle("selected-shape");
            }
        }

        if (tools.view3d === true) {
            decorate3dview();
            document.getElementById('3d_view').style.display = 'block';
        }

        
        function decorateHomework() {
            let image = new Image();
            image.onload = () => {
                getContext('homework').drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.homework;
        }

            decorateHomework();
            document.getElementById('homework').style.display = 'block';

        function decoratemovie() {
            let image = new Image();
            image.onload = () => {
                getContext('movie').drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.movie;

            document.getElementById('movie').onclick = function(){
                this.classList.toggle("on");
                this.classList.toggle("selected-shape");
            }
        }

        if (tools.view3d === true) {
            decoratemovie();
            document.getElementById('movie').style.display = 'block';
        }

        
        function decoratecallteacher() {
            let image = new Image();
            image.onload = () => {
                getContext('callteacher').drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.callteacher;
        }

        if (tools.view3d === true) {
            decoratecallteacher();
            document.getElementById('callteacher').style.display = 'block';
        }


        function decorateFile() {
            let image = new Image();
            image.onload = () => {
                getContext('file').drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.file;
        }

        if (tools.view3d === true) {
            decorateFile();
            document.getElementById('file').style.display = 'block';
        }


        function decoratePencil() {
            function hexToRGBA(h, alpha) {
                return 'rgba(' + hexToRGB(h).join(',') + ',1)';
            }

            var context = getContext('pencilIcon');

            var image = new Image();
            image.onload = () => {
                context.drawImage(image, 0, 0, 28, 28);
                bindEvent(context, 'Pencil');
            };
            image.src = data_uris.pencilIcon;

            var pencilContainer = find('pencil-container'),
                strokeStyleText = find('pencil-stroke-style'),
                fillStyleText = find('pencil-fill-style'),
                btnPencilDone = find('pencil-done'),
                canvas = context.canvas,
                alpha = 0.2;

            // START INIT PENCIL
            pencilStrokeStyle = hexToRGBA("#484848", alpha)

            // END INIT PENCIL

            addEvent(canvas, 'click', function(){
                hideContainers();
                if(this.classList.contains('off'))
                    return false;

                document.getElementById("temp-canvas").className = "";
                document.getElementById("temp-canvas").classList.add("pen");

                pencilContainer.style.display = 'block';
                pencilContainer.style.top = (canvas.offsetTop) + 'px';
                pencilContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) - 2 + 'px';
            });

            addEvent(btnPencilDone, 'click', () => {
                pencilContainer.style.display = 'none';
                pencilLineWidth = strokeStyleText.value;
                pencilStrokeStyle = hexToRGBA(fillStyleText.value, alpha);
            });
        }

        if (tools.pencil === true) {
            decoratePencil();
            document.getElementById('pencilIcon').style.display = 'block';
        }

        function decorateMarker() {
            function hexToRGBA(h, alpha) {
                return 'rgba(' + hexToRGB(h).join(',') + ',' + alpha + ')';
            }

            var context = getContext('markerIcon');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 0, 0, 28, 28);
                bindEvent(context, 'Marker');
            };
            image.src = data_uris.markerIcon;

            var markerContainer = find('marker-container'),
                strokeStyleText = find('marker-stroke-style'),
                fillStyleText = find('marker-fill-style'),
                btnMarkerDone = find('marker-done'),
                canvas = context.canvas,
                alpha = 0.2;

            // START INIT MARKER
            markerStrokeStyle = hexToRGBA("#F12A2A", alpha)
     
        

            // END INIT MARKER

            addEvent(canvas, 'click', function() {
                if(this.classList.contains('off'))
                    return false;
                hideContainers();
                document.getElementById("temp-canvas").className = "";
                document.getElementById("temp-canvas").classList.add("marker");

                markerContainer.style.display = 'block';
                markerContainer.style.top = (canvas.offsetTop + 1) + 'px';
            });

            addEvent(btnMarkerDone, 'click', () => {
                markerContainer.style.display = 'none';

                markerLineWidth = strokeStyleText.value;
                markerStrokeStyle = hexToRGBA(fillStyleText.value, alpha);
            });

    
        }

        if (tools.marker === true) {
            decorateMarker();
            document.getElementById('markerIcon').style.display = 'block';
        }

        function decorateEraser() {
            var context = getContext('eraserIcon');

            var image = new Image();
            image.onload = () => {
                context.drawImage(image, 0, 0, 28, 28);
                bindEvent(context, 'Eraser');
            };
            image.src = data_uris.eraserIcon;
        }
        if (tools.eraser === true) {
            decorateEraser();
            document.getElementById('eraserIcon').style.display = 'block';
        }

        function decorateText() {
            var context = getContext('textIcon');

            var image = new Image();
            image.onload = () => {
                context.drawImage(image, 0, 0, 28, 28);
                bindEvent(context, 'Text');
            };
            image.src = data_uris.textIcon;
        }

        if (tools.text === true) {
            decorateText();
            document.getElementById('textIcon').style.display = 'block';
        }

        function decorateImage() {
            var context = getContext('image-icon');

            var image = new Image();
            image.onload = () => {
                context.drawImage(image, 0, 0, 28, 28);
                bindEvent(context, 'Image');
            };
            image.src = data_uris.image;
        }

        if (tools.image === true) {
            decorateImage();
            document.getElementById('image-icon').style.display = 'block';
        }


        function decorateclearCanvas() {
            var context = getContext('clearCanvas');

            var image = new Image();
            image.onload = () => {
                context.drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.clearCanvas;

            document.querySelector('#clearCanvas').onclick = () => {
                if(this.classList.contains('off'))
                return false;

                if(points.length < 1){
                    return false;
                }

                window.parent.currentPoints = []
                window.parent.currentHistory = []

                points = []
                pointHistory = [];
                drawHelper.redraw();

                syncPoints(true, "clear");
            };
        }

        if (tools.clearCanvas === true) {
            decorateclearCanvas();
            document.getElementById('clearCanvas').style.display = 'block';
        }

        function decorateScreenShare() {
            var image = new Image();
            image.onload = () => {
                getContext('screen_share').drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.screenShare;
        }

        if (tools.clearCanvas === true) {
            decorateScreenShare();
            document.getElementById('screen_share').style.display = 'block';
        }

        function decoratEpub() {
            var image = new Image();
            image.onload = () => {
                getContext('epub').drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.epub;

            document.getElementById('epub').onclick = function(){
                this.classList.toggle("on");
                this.classList.toggle("selected-shape");
            }
        }

        if (tools.clearCanvas === true) {
            decoratEpub();
            document.getElementById('epub').style.display = 'block';
        }

        function decorateonoff(){
            var context = getContext('onoff-icon');

            var image = new Image();
            image.onload = () => {
                context.clearRect(0, 0, 40, 40);
                context.drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.on;
            
            document.querySelector('#onoff-icon').onclick = () => {
                this.classList.toggle("on");
                // this.classList.toggle("off");

                var isOn = this.classList.contains("on");
                
                function changeColor(id, alpha){
                    var ctx = getContext(id.id);
                    var nimage = new Image();
                    
                    nimage.onload = () => {
                        ctx.globalAlpha = alpha;
                        ctx.clearRect(0, 0, 40, 40);
                        ctx.drawImage(nimage, 0, 0, 28, 28);
                    };
                    nimage.src = id.toDataURL();
                }

                function returnColor(id){
                    var ctx =getContext(id.id);
                    var nimage = new Image();
                    nimage.onload = () =>{
                        ctx.globalAlpha = 1;
                        ctx.clearRect(0,0,40,40);
                        ctx.drawImage(nimage,0,0,28,28);
                    }
                    nimage.src = data_uris[id.id];
                }

                if(isOn){

                    image.src = data_uris.on;
                    var icons = document.getElementById('tool-box').children;
                    for(var i = 0 ; i < icons.length; i++){
                        if(!icons[i].classList.contains('draw') || icons[i].id == 'onoff-icon')
                            continue;
                        returnColor(icons[i]);
                        icons[i].classList.remove("off");
                        icons[i].classList.add("on");
                    }
                    document.getElementById("main-canvas").style.display = 'block';
                    document.getElementById("temp-canvas").style.display = 'block';
                }
                else{
                    image.src = data_uris.off;
                    var icons = document.getElementById('tool-box').children;
                    for(var i = 0 ; i < icons.length; i++){

                        if(!icons[i].classList.contains('draw') || icons[i].id == 'onoff-icon')
                            continue;

                            var dis = icons[i].style.display;
        
                            if(dis == 'block'){
                                changeColor(icons[i], 0.3);
                                icons[i].classList.remove("on");
                                icons[i].classList.add("off");
                        }
                    }

                    document.getElementById("main-canvas").style.display = 'none';
                    document.getElementById("temp-canvas").style.display = 'none';
                    document.getElementById("pencil-container").style.display = 'none';
                    document.getElementById("marker-container").style.display = 'none';
                }

            };
        }

        if (tools.onoff === true) {
            decorateonoff();
            document.getElementById('onoff-icon').style.display = 'block';
        }
        
        var isAbsolute = find('is-absolute-points'),
            isShorten = find('is-shorten-code');

        addEvent(isShorten, 'change', common.updateTextArea);
        addEvent(isAbsolute, 'change', common.updateTextArea);
    })();

    function hideContainers() {
        var 
            markerContainer = find('marker-container'),
            pencilContainer = find('pencil-container');
            markerContainer.style.display =
            pencilContainer.style.display = 'none';
    }

    function setTemporaryLine() {
        var arr = ["line", [139, 261, 170, 219],
            [1, "rgba(0,0,0,0)", "rgba(0,0,0,0)", 1, "source-over", "round", "round", "15px \"Arial\""]
        ];
        points.push(arr);
        drawHelper.redraw();

        setTimeout(() => {
            setSelection(document.getElementById('line'), 'Line');
        }, 1000);

        setTimeout(setDefaultSelectedIcon, 2000);
    }

    var canvas = tempContext.canvas;

    function TouchConverter(e){
        var r = {
            pageX : e.touches[0].pageX,
            pageY : e.touches[0].pageY,
        }   
        return r;

    }

    addEvent(canvas, 'touchstart mousedown', function(e) {
        if(e.touches){
            e = TouchConverter(e);
        }

        var cache = is;
        window.parent.document.getElementById("student-menu").style.display = 'none';
        if (cache.isPencil) pencilHandler.mousedown(e);
        else if (cache.isEraser) eraserHandler.mousedown(e);
        else if (cache.isText) textHandler.mousedown(e);
        else if (cache.isMarker) markerHandler.mousedown(e);

        if(!cache.isMarker)
            drawHelper.redraw();
        
            preventStopEvent(e);
    });

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

    addEvent(canvas, 'touchend mouseup', function(e) {
        let cache = is;
        let command = "default";

        if (cache.isPencil) {
            command = "pen";
            pencilHandler.mouseup(e);
        }
        else if (cache.isEraser) {
            command = "eraser";
            eraserHandler.mouseup(e);
        }
        else if (cache.isMarker) {
            command = "marker";
            markerHandler.mouseup(e);
        }
    

        !cache.isPdf && drawHelper.redraw();

        if(!cache.isEraser) {
            syncPoints(false, command);
        }

        preventStopEvent(e);
    });

    addEvent(canvas, 'touchmove mousemove', function(e) {
        if(e.touches){
            e = TouchConverter(e);
        }

        var cache = is;

        if (cache.isPencil)    pencilHandler.mousemove(e);
        else if (cache.isEraser)    eraserHandler.mousemove(e);
        else if (cache.isText)      textHandler.mousemove(e);
        else if (cache.isMarker)    markerHandler.mousemove(e);

        preventStopEvent(e);
    });

    var keyCode;

    function onkeydown(e) {
        keyCode = e.which || e.keyCode || 0;
    }

    addEvent(document, 'keydown', onkeydown);

    function onkeyup(e) {
        if (e.which == null && (e.charCode != null || e.keyCode != null)) {
            e.which = e.charCode != null ? e.charCode : e.keyCode;
        }
        keyCode = e.which || e.keyCode || 0;
        if (keyCode === 13 && is.isText) {
            textHandler.onReturnKeyPressed();
            return;
        }
        // Undo
        if (keyCode === 90 && e.ctrlKey) {
            if (points.length) {
                var idx = pointHistory.length - 2;

                if(idx == -1 ){
                    points = []
                }
                else{
                    points.length = pointHistory[idx];
                }
                
                pointHistory.pop();
                drawHelper.redraw();
            }
            syncPoints(true, "undo");
        }
    }

    addEvent(document, 'keyup', onkeyup);

    function onkeypress(e) {
        if (e.which == null && (e.charCode != null || e.keyCode != null)) {
            e.which = e.charCode != null ? e.charCode : e.keyCode;
        }
        keyCode = e.which || e.keyCode || 0;
    }

    addEvent(document, 'keypress', onkeypress);

    var lastPointIndex = 0;
    var uid;

    window.addEventListener('message', function(event) {
        if (!event.data) return;

        if (!uid) {
            uid = event.data.uid;
        }

        if (event.data.captureStream) {
            webrtcHandler.createOffer(function(sdp) {
                sdp.uid = uid;
                window.parent.postMessage(sdp, '*');
            });
            return;
        }

        if (event.data.renderStream) {
            setTemporaryLine();
            return;
        }

        if (event.data.sdp) {
            webrtcHandler.setRemoteDescription(event.data);
            return;
        }

        if (event.data.genDataURL) {
            var dataURL = context.canvas.toDataURL(event.data.format, 1);
            window.parent.postMessage({
                dataURL: dataURL,
                uid: uid
            }, '*');
            return;
        }

        if (event.data.undo && points.length) {
            var index = event.data.index;

            if (index === 'all') {
                points = [];
                drawHelper.redraw();
                syncPoints(true);
                return;
            }

            if (index.numberOfLastShapes) {
                try {
                    points.length -= index.numberOfLastShapes;
                } catch (e) {
                    points = [];
                }

                drawHelper.redraw();
                syncPoints(true);
                return;
            }

            if (index === -1) {
                points.length = points.length - 1;
                drawHelper.redraw();
                syncPoints(true);
                return;
            }

            if (points[index]) {
                var newPoints = [];
                for (var i = 0; i < points.length; i++) {
                    if (i !== index) {
                        newPoints.push(points[i]);
                    }
                }
                points = newPoints;
                drawHelper.redraw();
                syncPoints(true);
            }
            return;
        }

        if (event.data.syncPoints) {
            syncPoints(true);
            return;
        }

        if (event.data.clearCanvas) {
            points = [];
            drawHelper.redraw();
            return;
        }

        if(event.data.SyncAllPoint){
            console.error("OK!");
        }

        if (!event.data.canvasDesignerSyncData) return;

        var data = event.data.canvasDesignerSyncData;
        if(data.isStudent){
            var id = data.userid;
            if(id == undefined){
                Object.keys(studentPoints).forEach(function(key){
                    studentPoints[key].length = 0;
                })
            }
            else{
                if(!studentPoints[id])
                    studentPoints[id] = []
                PushPoints(data, studentPoints[id]);
            }
        }
        else {
            PushPoints(data, teacherPoints);
        }


        lastPointIndex = points.length;
        drawHelper.redraw();
    }, false);

    var _uid = window.parent.connection.userid;

    function PushPoints(data, array){
        
        switch(data.command){
            case "eraser" :
                array.splice(data.idx,1);
                break;
            case "clear" :
                array.length = 0;
                break;
            case "my" :
                points = data.points;
                pointHistory = data.history;
                window.parent.currentPoints = points;
                window.parent.currentHistory = pointHistory;
                break;
            case "default":
            case "loaddata":
                var startIdx = 0;
                data.history.forEach(function(history){
                    if(startIdx == history)
                        return false;
                    var points = data.points.slice(startIdx, history);
                    var command = points[0][0];
                    var startIndex = startIdx;
                    startIdx = history;

                    var d = {
                        points : points,
                        command : command,
                        startIndex : startIndex,
                        userid : data.userid,
                    }
                    array.push(d);
                })
                break;
            case "load":
                array.length = 0;
                data.history.forEach(function(history){
                    if(startIdx == history)
                        return false;
                    var points = data.points.slice(startIdx, history);
                    var command = points[0][0];
                    var startIndex = startIdx;
                    startIdx = history;

                    var d = {
                        points : points,
                        command : command,
                        startIndex : startIndex,
                        userid : data.userid,
                    }
                    array.push(d);
                })
                break;
            case "clearcanvas" :
                points.length = 0;
                pointHistory.length = 0
                window.parent.currentPoints = points;
                window.parent.currentHistory = pointHistory;
            case "clearteacher":
            case "clearstudent":
                array.length = 0;
                break;
            default :
                array.push(data);
        }
    }

    function syncData(data) {
        // teacher....
        data.pageidx = window.parent.pointer_saver.nowIdx;
        data.userid = _uid;
        data.history = pointHistory;
        data.startIndex = points.length;
        lastPointIndex = points.length;
        // console.log("SEND",_uid, data);
        window.parent.postMessage({
            canvasDesignerSyncData: data,
            uid: uid
        }, '*');

        window.parent.currentPoints = points;
        window.parent.currentHistory = pointHistory;
    }

    function syncPoints(isSyncAll, command = "default") {
        if (isSyncAll) {
            lastPointIndex = 0;
        }

        window.parent.currentPoints = points;
        window.parent.currentHistory = pointHistory;

        var pointsToShare = [];
        for (var i = lastPointIndex; i < points.length; i++) {
            pointsToShare[i - lastPointIndex] = points[i];
        }

        syncData({
            points: pointsToShare || [],
            command: command,
            startIndex: lastPointIndex
        });

        if (!pointsToShare.length && points.length) return;
        lastPointIndex = points.length;
    }

    var webrtcHandler = {
        createOffer: function(callback) {
            var captureStream = document.getElementById('main-canvas').captureStream();
            var peer = this.getPeer();

            captureStream.getTracks().forEach(function(track) {
                peer.addTrack(track, captureStream);
            });

            peer.onicecandidate = function(event) {
                if (!event || !!event.candidate) {
                    return;
                }

                callback({
                    sdp: peer.localDescription.sdp,
                    type: peer.localDescription.type
                });
            };
            peer.createOffer({
                OfferToReceiveAudio: false,
                OfferToReceiveVideo: false
            }).then(function(sdp) {
                peer.setLocalDescription(sdp);
            });
        },
        setRemoteDescription: function(sdp) {
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp)).then(function() {
                if (typeof setTemporaryLine === 'function') {
                    setTemporaryLine();
                }
            });
        },
        createAnswer: function(sdp, callback) {
            var peer = this.getPeer();
            peer.onicecandidate = function(event) {
                if (!event || !!event.candidate) {
                    return;
                }

                callback({
                    sdp: peer.localDescription.sdp,
                    type: peer.localDescription.type
                });
            };
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp)).then(function() {
                peer.createAnswer({
                    OfferToReceiveAudio: false,
                    OfferToReceiveVideo: true
                }).then(function(sdp) {
                    peer.setLocalDescription(sdp);
                });
            });

            peer.ontrack = function(event) {
                console.error("ONTRACK..")
                callback({
                    stream: event.streams[0]
                });
            };
        },
        getPeer: function() {
            let WebRTC_Native_Peer = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
            let peer = new WebRTC_Native_Peer(null);
            this.peer = peer;
            return peer;
        }
    };


    let c = document.getElementsByClassName("i");
    for(let i = 0 ; i < c.length; i++){
        c[i].addEventListener("click", function(){
            document.getElementById("marker-container").style.display = 'none';
            document.getElementById("pencil-container").style.display = 'none';
        })
    }

    MakeTitlePop("onoff-icon", "판서 기능을 켜고 끕니다");
    MakeTitlePop("pencilIcon", "연필");
    MakeTitlePop("markerIcon", "마커");
    MakeTitlePop("eraserIcon", "지우개");
    MakeTitlePop("textIcon", "글자를 적습니다");
    MakeTitlePop("undo", "작업 하나를 취소합니다");
    MakeTitlePop("clearCanvas", "캔버스를 비웁니다");
    MakeTitlePop("screen_share", "내 화면을 공유합니다");
    MakeTitlePop("3d_view", "3D 모델을 공유합니다");
    MakeTitlePop("movie", "Youtube URL 로 동영상을 불러옵니다");
    MakeTitlePop("file", "파일을 불러옵니다");
    MakeTitlePop("epub", "E-Pub을 불러옵니다");
    MakeTitlePop("callteacher", "저요");
    MakeTitlePop("homework", "숙제를 제출합니다");

    var penColors = ["#484848", "#FFFFFF", "#F12A2A", "#FFEA31", "#52F12A", "#2AA9F1", "#BC4FFF"]

    SliderSetting("pencileslider", "pencil-stroke-style",1 , 22, 3, function(v){
        var pencilDrawHelper = clone(drawHelper);
        pencilDrawHelper.getOptions = () => {
            return [pencilLineWidth, pencilStrokeStyle, fillStyle, globalAlpha, font];
        }
        pencilLineWidth = v;
    });

    SliderSetting("markerslider", "marker-stroke-style",14, 40, 21, function(v){
        var markerDrawHelper = clone(drawHelper);
        markerDrawHelper.getOptions = () => {
            return [markerLineWidth, markerStrokeStyle, fillStyle, globalAlpha, font];
        }
        markerLineWidth = v;
    });

    ColorSetting('pencil-container', penColors);
    ColorSetting('marker-container', penColors);

    function ColorSetting(_container, colors){
        let container = document.getElementById(_container);
        let template = container.getElementsByClassName("color_template")[0];
        let divs = [];

        function hexToRGBA(h, alpha) {
            return 'rgba(' + hexToRGB(h).join(',') + ',' + alpha + ')';
        }
        
        colors.forEach(function(color){
            let div = document.createElement("div");
            div.dataset.color = color;
            div.className = "color";
            div.style.backgroundColor = color;
            divs.push(div);
            template.appendChild(div);
        });

        for(let i= 0 ; i < divs.length; i++){
            divs[i].addEventListener("click", () => {
                let nowColor = this.dataset.color;
                divs.forEach(element => element.classList.remove("on"));
                this.classList.add("on");
                if(_container == "pencil-container")
                    pencilStrokeStyle = nowColor;
                else if(_container == "marker-container")
                    markerStrokeStyle = hexToRGBA(nowColor, 0.2);
            })
        }
    }
})();

// -----------------------------------------------------------------------



function MakeTitlePop(element, contents){
    let ele = document.getElementById(element);
    let pop = document.getElementById("titlebox");

    ele.addEventListener("mouseover", function(){
        if(this.classList.contains("off"))
            return false;

        pop.style.display = 'block';
        let rect = ele.getBoundingClientRect();
        let y= rect.y;
        let height = 7;
        pop.style.top =  y + height+  'px';
        pop.children[0].innerHTML = contents;
    })

    ele.addEventListener("mouseleave", function(){
        pop.style.display = 'none';
    })
}


function SliderSetting(element, targetinput, min, max, defaultv, callback){
    max -= min;

    let slider = document.getElementById(element);
    let bar = slider.getElementsByClassName("slider_btn")[0];
    let back = slider.getElementsByClassName("slider-back")[0];
    let sliderval = document.getElementById(targetinput);
    let isClick = false;

    Set(defaultv);
    function Set(v){
        slider.parentElement.style.display = "block";
        let ratio = (v - min) / max;
        let sliderWidth = slider.getBoundingClientRect().width;
        // back.getBoundingClientRect().width = (ratio * sliderWidth) + 'px';
        back.style.width = (ratio * sliderWidth) + 'px';
        bar.style.left = (ratio * sliderWidth ) - bar.getBoundingClientRect().width / 2 + 'px';
        sliderval.value = (max * ratio).toFixed(0) * 1 + min;
        slider.parentElement.style.display = "none";
        callback(v);
    }

    bar.addEventListener("mousedown", function(){
        isClick = true;
    })

    window.addEventListener("mousemove", function(e){
        if(isClick){
            let sliderLeft = slider.getBoundingClientRect().left;
            let sliderWidth = slider.getBoundingClientRect().width;
            let mousex = e.x;
            let ratio = (mousex - sliderLeft) / sliderWidth;
            ratio = Math.min(Math.max(0, ratio), 1);
            back.style.width = (ratio * sliderWidth) + 'px';
            bar.style.left = (ratio * sliderWidth ) - bar.getBoundingClientRect().width / 2 + 'px';
            sliderval.value = (max * ratio).toFixed(0) * 1 + min;
        }
    })

    document.getElementById("temp-canvas").addEventListener("mouseup", function(){
        if(isClick){
            isClick = false;
            callback(sliderval.value);
        }
    })

    window.addEventListener("mouseup", function(){
        if(isClick){
            isClick = false;
            callback(sliderval.value);
        }
    })

    slider.addEventListener("mousedown", function(e){
        var sliderWidth = slider.getBoundingClientRect().width;
        var mousex = e.offsetX;
        isClick= true;

        if(e.target == bar){
            return false;
        }
        var ratio = mousex / sliderWidth;
        ratio = Math.min(Math.max(0, ratio), 1);
        back.style.width = (ratio * sliderWidth) + 'px';
        bar.style.left = (ratio * sliderWidth ) - bar.getBoundingClientRect().width / 2 + 'px';
        sliderval.value = (max * ratio).toFixed(0) * 1 + min;
    })
}

function handleDragDropEvent(oEvent) {
    oEvent.preventDefault();
  }


