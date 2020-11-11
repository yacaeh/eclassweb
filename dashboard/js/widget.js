// Last time updated: 2018-12-24 8:45:05 AM UTC

// _______________
// Canvas-Designer

// https://github.com/muaz-khan/Canvas-Designer

'use strict';

$(window).bind("load", function () {
    updateLanguage();
});

const penFont = new FontFace('나눔펜글씨', 'url(/dashboard/fonts/NanumPen.ttf)');
penFont.load().then((font) => {
    document.fonts.add(font);
});

const gothicFont = new FontFace('나눔고딕', 'url(/dashboard/fonts/NanumBarunGothic.ttf)');
gothicFont.load().then((font) => {
    document.fonts.add(font);
});

(function () {
    var context = getContext('main-canvas'),
        tempContext = getContext('temp-canvas');

    paper.setup(find("main-canvas"));

    var group = new paper.Group();

    var _uid = window.parent.connection.userid;
    let penColors = ["#484848", "#FFFFFF", "#F12A2A", "#FFEA31", "#52F12A", "#2AA9F1", "#BC4FFF"]
    var canvas = tempContext.canvas;
    var teacherPoints = [];
    var studentPoints = {};
    var pointHistory = [];
    var orderHistory = [];
    var markerpoint = [];

    var pencilContainer = find('pencil-container');
    var markerContainer = find('marker-container');
    var tempCanvas = find("temp-canvas");
    var iframe = window.parent.document.getElementById("widget-container").getElementsByTagName('iframe')[0];
    let zoom = new ZoomManager(iframe);
    zoom.setEvent(tempCanvas);

    var points = [],
        lineWidth = 2,
        strokeStyle = '#6c96c8',
        fillStyle = '#484848',
        globalAlpha = 1,
        font = '48px "나눔펜글씨"';

    document.addEventListener("click", function () {
        window.focus();
    });

    var is = {
        isLine: false,
        isPencil: false,
        isMarker: true,
        isEraser: false,
        isText: false,
        screenShare: false,
        view3d: false,

        set: function (shape) {
            let cache = this;
            cache.isLine = cache.isPencil = cache.isMarker = cache.isEraser = cache.isText = false;
            cache['is' + shape] = true;
        }
    };
    let undoicon = find('undo');

    function orderHistoryChecker() {
        if (orderHistory.length > 50)
            orderHistory.splice(0, 1);
        if (orderHistory.length == 0) {
            changeColor(undoicon, 0.3);
        }
        else if (orderHistory.length == 1) {
            returnColor(undoicon);
        }
    }


    function addEvent(element, eventType, callback) {
        if (eventType.split(' ').length > 1) {
            let events = eventType.split(' ');
            for (let i = 0; i < events.length; i++)
                addEvent(element, events[i], callback);
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
        let ret = document.getElementById(selector) || window.parent.document.getElementById(selector);;
        if (!ret)
            console.log(selector);

        return ret;
    }

    function getContext(id) {
        var canv = find(id),
            ctx = canv.getContext('2d');
        canv.setAttribute('width', innerWidth);
        canv.setAttribute('height', innerHeight);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.fillStyle = fillStyle;
        ctx.font = font;
        return ctx;
    }

    function normalizePoint(x, y) {
        return [x / canvas.width, y / canvas.height];
    }

    function resizePoint(point) {
        const p0 = canvas.width * point[0];
        const p1 = canvas.height * point[1];
        return [p0, p1];
    }

    window.resize = function () {
        canvasresize('main-canvas');
        canvasresize('temp-canvas');
        paper.view.viewSize = new paper.Size(innerWidth, innerHeight);
        drawHelper.redraw();
    }

    function canvasresize(id) {
        var canv = find(id);
        if (!canv)
            return;

        canv.setAttribute('width', innerWidth);
        canv.setAttribute('height', innerHeight);
    }

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
        if (obj === null || typeof (obj) !== 'object' || 'isActiveClone' in obj) return obj;

        let temp = obj instanceof Date ? new obj.constructor() : obj.constructor()
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                obj['isActiveClone'] = null;
                temp[key] = clone(obj[key]);
                delete obj['isActiveClone'];
            }
        }

        return temp;
    }

    function hexToRGB(h) {
        return [hexToR(h), hexToG(h), hexToB(h)]
    }

    var drawHelper = {
        prepoint: [],
        marking: false,

        redraw: function () {
            tempContext.clearRect(0, 0, innerWidth, innerHeight);
            context.clearRect(0, 0, innerWidth, innerHeight);

            var path = undefined;
            var start = undefined;

            context.lineCap = "round";
            context.lineJoin = "round";
            group.removeChildren();
            let _this = this;

            Object.keys(studentPoints).forEach(function (e) {
                studentPoints[e].forEach(function (data) {
                    drawpoint(data.points);
                })
            })

            teacherPoints.forEach(function (data) {
                drawpoint(data.points);
            })

            drawpoint(points);

            paper.view.draw();

            function drawpoint(points) {
                let end = true;
                points.forEach(function (point) {
                    if (point[0] == "marker" || point[0] == "line") {
                        if (point[1][0] == -1) {
                            path.smooth();
                            path.simplify();
                            end = true;
                            group.addChild(path);
                            return true;
                        }

                        if (end) {
                            path = new paper.Path();
                            start = new paper.Point(resizePoint(point[1]));
                            path.moveTo(start);
                            path.strokeColor = point[2][1];
                            path.strokeWidth = point[2][0]
                            path.strokeCap = 'round';

                            end = false;
                            return true;
                        }

                        path.lineTo(resizePoint(point[1]));
                    }
                    else {
                        let size = point[2][4].split(' ')[0];
                        let font = point[2][4].split(' ')[1];


                        let text = new paper.PointText({
                            point: resizePoint([point[1][1], point[1][2]]),
                            justification: 'center',
                            content: point[1][0].substr(1, point[1][0].length - 2),
                            fillColor: point[2][2],
                            fontFamily: font,
                            fontSize: size
                        });
                        group.addChild(text);
                    }

                });
                _this.prepoint = [];

            }
        },

        getOptions: function (opt) {
            opt = opt || {};
            return [
                opt.lineWidth || lineWidth,
                opt.strokeStyle || strokeStyle,
                opt.fillStyle || fillStyle,
                opt.globalAlpha || globalAlpha,
                opt.font || font
            ];
        },
        handleOptions: function (context, opt, isNoFillStroke) {
            opt = opt || this.getOptions();

            context.lineWidth = opt[0];
            context.strokeStyle = opt[1];
            context.fillStyle = opt[2];
            context.globalAlpha = opt[3];

            if (!isNoFillStroke) {
                context.stroke();
                // context.fill();
            }
        },
        line: function (context, point, options, nopre = false) {
            if (point[0] == -1) {
                context.stroke();
                context.beginPath();
                this.prepoint = [];
                return;
            }

            const p = resizePoint(point);
            context.beginPath();

            let x, y;

            x = !nopre ? this.prepoint[0] || p[0] : p[0];
            y = !nopre ? this.prepoint[1] || p[1] : p[1];

            context.moveTo(x, y);
            context.lineTo(p[0], p[1]);

            this.prepoint[0] = p[0];
            this.prepoint[1] = p[1];

            this.handleOptions(context, options);
        },
        marker: function (context, point, options) {
            context.beginPath();
            context.clearRect(0, 0, innerWidth, innerHeight)

            let pre = [];
            for (let i = 0; i < point.length; i++) {
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
    };

    var pencilHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function (e) {
            let x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            let t = this;

            const normalized = normalizePoint(x, y);
            let nx = normalized[0];
            let ny = normalized[1];

            t.prevX = nx;
            t.prevY = ny;

            t.ismousedown = true;

            tempContext.lineCap = 'round';
            let opt = pencilDrawHelper.getOptions();
            pencilDrawHelper.line(tempContext, [t.prevX, t.prevY], opt, true);
            points[points.length] = ['line', [t.prevX, t.prevY], opt];
            pencilContainer.style.display = 'none';
        },
        mouseup: function () {
            points[points.length] = ['line', [-1, -1]];
            pointHistory.push(points.length);
            orderHistory.push('undo');
            orderHistoryChecker();
            this.ismousedown = false;
        },
        mousemove: function (e) {
            let x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            const normalized = normalizePoint(x, y);
            let nx = normalized[0];
            let ny = normalized[1];

            let t = this;

            if (t.ismousedown) {
                tempContext.lineCap = 'round';
                let opt = pencilDrawHelper.getOptions()
                pencilDrawHelper.line(tempContext, [t.prevX, t.prevY], opt);
                points[points.length] = ['line', [t.prevX, t.prevY], opt];
                t.prevX = nx;
                t.prevY = ny;
            }
        }
    }

    var pencilLineWidth = find('pencil-stroke-style').value,
        pencilStrokeStyle = '#484848';

    var pencilDrawHelper = clone(drawHelper);

    pencilDrawHelper.getOptions = function () {
        return [pencilLineWidth, pencilStrokeStyle];
    }


    var markerHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function (e) {
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

            markerContainer.style.display = 'none';
        },
        mouseup: function (e) {
            points[points.length] = ['marker', [-1, -1]];
            pointHistory.push(points.length);
            orderHistory.push('undo');
            orderHistoryChecker();
            this.ismousedown = false;
        },
        mousemove: function (e) {
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

    var markerLineWidth = find('marker-stroke-style').value,
        markerStrokeStyle = '#F12A2A';

    var markerDrawHelper = clone(drawHelper);

    markerDrawHelper.getOptions = function () {
        return [markerLineWidth, markerStrokeStyle];
    }

    function isNear(x, y, point) {
        return Math.pow(x - point[0], 2) + Math.pow(y - point[1], 2) < 0.0005 ? true : false;
    }

    var eraserHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,

        mousedown: function (e) {

            let x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;
            let t = this;
            t.ismousedown = true;
            const normalized = normalizePoint(x, y);
            x = normalized[0];
            y = normalized[1];
            t.prevX = x;
            t.prevY = y;
            this.eraser(x, y);
        },
        mouseup: function (e) {
            this.ismousedown = false;
        },
        mousemove: function (e) {
            let x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            let t = this;

            const normalized = normalizePoint(x, y);
            x = normalized[0];
            y = normalized[1];

            if (t.ismousedown) {
                this.eraser(x, y)
            }
        },
        eraser(x, y) {
            let pre = undefined;
            let _idx = undefined;
            let near = undefined;

            points.forEach(function (point, idx) {
                if (point[0] == "text") {
                    let tempPoint = [point[1][1], point[1][2]];
                    near = isNear(x, y, tempPoint);
                }
                else {
                    near = isNear(x, y, point[1]);
                }


                if (near) {
                    for (let i = 0; i < pointHistory.length; i++) {
                        if (idx < pointHistory[i]) {
                            pre = i == 0 ? 0 : pointHistory[i - 1];
                            _idx = i;
                            let numofpoint = pointHistory[i] - pre
                            let orderdata = {};
                            orderdata[pre] = points.slice(pre, pre + numofpoint);
                            orderHistory.push(orderdata);
                            orderHistoryChecker();
                            points.splice(pre, numofpoint);
                            pointHistory.splice(i, 1);

                            for (let z = i; z < pointHistory.length; z++) {
                                pointHistory[z] -= numofpoint;
                            }

                            lastPointIndex = points.length;

                            window.parent.currentPoints = points;
                            window.parent.currentHistory = pointHistory;

                            if (_idx != undefined) {
                                let data = {
                                    points: [],
                                    history: pointHistory,
                                    command: "eraser",
                                    idx: _idx,
                                    userid: _uid,
                                }
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
        onShapeSelected: function () {
            tempCanvas.className = "texti";
            this.x = this.y = this.pageX = this.pageY = 0;
            this.text = '';
        },
        onShapeUnSelected: function () {
            this.text = '';
            this.showOrHideTextTools('hide');
        },
        getFillColor: function (color) {
            color = (color || fillStyle).toLowerCase();

            if (color == 'rgba(255, 255, 255, 0)' || color == 'transparent' || color === 'white') {
                return 'black';
            }

            return color;
        },
        index: 0,
        getOptions: function () {
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
        appendPoints: function () {
            let options = textHandler.getOptions();
            const normal = normalizePoint(textHandler.x, textHandler.y)
            points[points.length] = ['text', ['"' + textHandler.text + '"', normal[0], normal[1]], drawHelper.getOptions(options)];
            pointHistory.push(points.length);
            orderHistory.push('undo');
            orderHistoryChecker();
            syncPoints(false, "text");
        },
        canvasInput: null,
        updateInput: function () {
            window.parent.document.querySelector(".textInputUI").focus();
            window.parent.document.querySelector(".textInputUI").addEventListener('change', (event) => {
                textHandler.text = event.target.value;
            });
        },
        mousedown: function (e) {
            this.updateInput();

            if (!is.isText) return;

            textHandler.x = textHandler.y = 0;
            textHandler.text = '';

            textHandler.pageX = e.pageX;
            textHandler.pageY = e.pageY;

            textHandler.x = e.pageX - canvas.offsetLeft - 5;
            textHandler.y = e.pageY - canvas.offsetTop + 10;

            this.showTextTools();
        },
        mousemove: function (e) { },
        showOrHideTextTools: function (show) {
            if (show === 'hide') {
                if (this.lastFillStyle.length) {
                    fillStyle = this.lastFillStyle;
                    this.lastFillStyle = '';
                }
            } else if (!this.lastFillStyle.length) {
                this.lastFillStyle = textHandler.lastFillStyle;
            }

            this.textInputBox.style.display = show == 'show' ? 'block' : 'none';
            this.textInputBox.style.left = this.x + 'px';
            this.textInputBox.style.top = this.y - this.textInputBox.clientHeight + 'px';

            this.fontColorBox.style.display = show == 'show' ? 'grid' : 'none';
            this.fontColorBox.style.left = this.x + 'px';
            this.fontColorBox.style.top = this.y - this.textInputBox.clientHeight - this.fontColorBox.clientHeight - 10 + 'px';

            this.fontFamilyBox.style.display = show == 'show' ? 'block' : 'none';
            this.fontSizeBox.style.display = show == 'show' ? 'block' : 'none';

            this.fontSizeBox.style.left = this.x + 'px';
            this.fontFamilyBox.style.left = (this.fontSizeBox.clientWidth + this.x) + 'px';

            this.fontSizeBox.style.top = this.y + 'px';
            this.fontFamilyBox.style.top = this.y + 'px';
        },
        showTextTools: function () {
            if (!this.fontFamilyBox || !this.fontSizeBox || !this.textInputBox || !this.fontColorBox) return;

            this.unselectAllFontFamilies();
            this.unselectAllFontSizes();

            this.showOrHideTextTools('show');
            let _this = this;

            this.eachFontFamily(function (child) {
                child.onclick = function (e) {
                    _this.eachFontFamily(function (child) {
                        child.className = '';
                    })
                    e.preventDefault();
                    textHandler.selectedFontFamily = this.innerHTML;
                    this.className = 'font-family-selected';
                };
                child.style.fontFamily = child.innerHTML;
            });

            this.eachFontSize(function (child) {
                child.onclick = function (e) {
                    _this.eachFontSize(function (child) {
                        child.className = '';
                    })
                    e.preventDefault();
                    textHandler.selectedFontSize = this.innerHTML;
                    this.className = 'font-size-selected';
                };
            });

            this.eachFontColor(function (child) {
                child.onclick = function (e) {
                    e.preventDefault();
                    textHandler.selectedFontColor = this.innerHTML;
                    this.className = 'font-color-selected';
                };
            });
            window.parent.document.getElementsByClassName("textInputUI")[0].focus();

        },
        //textStrokeStyle : '#' + find('text-fill-style').value,
        eachFontColor: function (callback) {
            var container = find('textInputContainer');
            var template = container.getElementsByClassName("color_template_text")[0];
            var divs = [];
            template.innerHTML = '';
            penColors.forEach(function (color) {
                var div = document.createElement("div");
                div.dataset.color = color;
                div.className = "color";
                div.style.backgroundColor = color;
                divs.push(div);
                template.appendChild(div);
            });

            for (var i = 0; i < divs.length; i++) {
                divs[i].addEventListener("click", function () {
                    var nowColor = this.dataset.color;
                    divs.forEach(element => element.classList.remove("on"));
                    this.classList.add("on");
                    textHandler.lastFillStyle = nowColor;
                })
            }
        },
        eachFontFamily: function (callback) {
            var childs = this.fontFamilyBox.querySelectorAll('li');
            for (var i = 0; i < childs.length; i++) {
                callback(childs[i]);
            }
        },
        unselectAllFontFamilies: function () {
            this.eachFontFamily(function (child) {
                child.className = '';
                if (child.innerHTML === textHandler.selectedFontFamily) {
                    child.className = 'font-family-selected';
                }
            });
        },
        eachFontSize: function (callback) {
            var childs = this.fontSizeBox.querySelectorAll('li');
            for (var i = 0; i < childs.length; i++) {
                callback(childs[i]);
            }
        },
        unselectAllFontSizes: function () {
            this.eachFontSize(function (child) {
                child.className = '';
                if (child.innerHTML === textHandler.selectedFontSize) {
                    child.className = 'font-size-selected';
                }
            });
        },
        onReturnKeyPressed: function () {
            if (!textHandler.text || !textHandler.text.length) return;
            window.parent.document.querySelector('.textInputUI').value = "";
            this.appendPoints();
            drawHelper.redraw();
            this.showOrHideTextTools('hide');
        },
        textInputBox: window.parent.document.querySelector('.textInputUI'),
        fontFamilyBox: window.parent.document.querySelector('.fontSelectUl'),
        fontSizeBox: window.parent.document.querySelector('.fontSizeUl'),
        fontColorBox: find('textInputContainer').querySelector('.color_template_text'),
        textInputContainer: find('textInputContainer')
    };

    var icons = JSON.parse(params.icons);

    var data_uris = {
        pencilIcon: icons.pencil,
        markerIcon: icons.marker,
        eraserIcon: icons.eraser,
        textIcon: icons.text || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAWVJREFUeJzt28ENgzAQAEETpf+WSQfJA6xD2ZkCjCWv7mFgLQAAAKDimN4A69y8/tczfm1+OA8ngDgBxAkgTgBxAogTQJx7gOf7dU9w6QxNgDgBxAkgTgBxAogTQJwA4t43rLH7ffa/G72LMQHiBBAngDgBxAkgTgBxAogTQJwA4gQQJ4A4AcQJIE4AcQKIu+N7gOl/C65+jzC9/1EmQJwA4gQQJ4A4AcQJIE4AcQKIE0CcAOIEECeAOAHECSBOAHECiBNAnADiBBAngDgBxAkgTgBxAogTQJwA4gQQJ4A4AcQJIE4AcQKIE0CcAOIEECeAOAHECSBOAHECiBNAnADiBBAngDgBxAkgTgBxAogTQJwA4gQQJ4A4AcQJIE4AcQKIE0CcAOIEECeAOAHECSBOAHECiBNAnADiBBAngDgBxAkgTgBxx/QGWOfm9b+esQkQJ4A4AcQJIE4AcQKIEwAAAABAxAcVTAXjELyg1wAAAABJRU5ErkJggg==',
        undo: icons.undo || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABPxJREFUeNrsnVuIVVUYx9dpQiIdvOBtDGa8RILSQz4koWYvRZeXEkRztJd8ExGkSPBRSxDMB0ESxBBpSnyLMCGJChV6SSURpEkcZia8RjqpmTTT97HXYQYcZ87Za5+z917f7wd/BhT1eNZvfWutvdbeuzI0NOTALk/wFSAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAlBq9LyAkJeY5yWeSmabbz6gA70n6JX9LplkWwNoQME/yleSwZI7ktn6HzAFsoL3+R8kaBv5hnjTS63fR8DYrAL3eaAWg1xuuAPR6oxWAXm+4AtDrjVYA7fWfSNbSlPYqQLXX0/jGKgC93nAFoNcbrQD0esMVgF5vtALQ6w1XAHq90QqQR6//jwpgt9dXJE9LWqwKUAk91lWpVEI/Q4fkY0lnDv9/7f2/Sf5yyfEw/XlLck3SI+mT9PqfA0VswOD2y1mATt/4HQXuJPcl170oFyVnJeckl/zvIUDKsV4b/t2SVs5/Jb9Lzki+l/wg+aOMAuRxKniDL69DEUUrxDE/f5nWbAHKcix8ruTLyBp+tFyW7JY8jwDDrI+w14+Xu5IjkhctCzDPSK8fK/9IDrrkTiRTAmww2OvHii4tt/nrDlELoGP9FzT4Y6Mrh5diFaCTXl9T9KLShzEJMJexPlW6JDPKLsBGfxGEBk2XXyQL8xIgi82gQQchvCA5IVma27XkDIaADiZ+mawSXolhEniFxkydm5KVLANt56pkSQwXgqgG6dMtaY/hUjBzg/TR01ETY9kMWkc1SJW9sW0HUw3qiy6x34lFAOYG6aLf1eyYBGBuUH8OxCYAc4P6omcQl8UoQN5zg0G/M6enex8WXILv3Cj3cYS2XxHuCxh5gGRnrevfjPhT8qo/tTPJZ6pLnh/c7uXU4WqBZLrL/0aatyTHy34qeLxq0NXEXqWneVvH+UwtXoiXJZslR3M883DSJXczRTUEPG6l0Iwv+Ybv2fUyRfKGZJ9L7g9olgB6J9MKCwI0a26QVoCRTJa87ZL7AgaaIMEhKwJUWd/AlUIWAoxkkZ/HXG7wjmGbJQEaWQ2yFqCKHvPa6jd1GiHBRmsCNGpu0CgBqsxyydNL72UswNdWBci6GjRagCp6DPznDAXQW9jnWBUgy7lBswSorhz2ZyjBKusCZFENmilAlS2SBxkIsAcBwncY8xBAWe2G31eUNj/plUkECNthzEsA5U1/KTrkFPFMBAirBnkKoLwuuROwkbWc18Y9ilaBlX5PoejoDSHv++3euvfhXHL7fRCxvjSqx1eC6oMpioxeQv4g5Z99NvhfN/Dm0LFWCnkPASPZk2IY+Jw5QNjcoEgCTJB8W6cA3yBA2EqhSAIoz7j6NpJOI0D6atDnL8jMKNhne81PCmsR4FcESM98l7w+vq2An21HjQJ0I0A4RVwJPSU5VYMAvVwHCKeID7jQQ6qbXPIA67FoidF+SDjvkrME5sofDPOpS84RNKx6IUCx0aFgq1+tUAGMog+WPIAAttFl4ZVRfr2CADbQo+DbEcA2+iTW4whgF73w85HL+OVVCFAuLjh/GNQzIfQvLNLt4VAbrX4o0FfS9Ev7Lc5VACg3DAEIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgApeN/AQYAUjtq/Zx6jVYAAAAASUVORK5CYII=',
        clearCanvas: icons.clearCanvas,
        on: icons.on,
        off: icons.off,
        screenShare: icons.screenShare,
        view3d: icons.view3d,
        movie: icons.movie,
        file: icons.file,
        epub: icons.epub,
        callteacher: icons.callteacher,
        fulloff: icons.fulloff,
        fullon: icons.fullon,
        homework: icons.homework,
    };

    function setSelection(element, prop) {

        if (textHandler.text && textHandler.text.length) {
            textHandler.appendPoints();
            textHandler.onShapeUnSelected();
        }
        textHandler.showOrHideTextTools('hide');

        is.set(prop);
        var selected = document.getElementsByClassName('selected-shape')[0];
        if (selected) selected.className = selected.className.replace(/selected-shape/g, '');
        if (!element.className) {
            element.className = '';
        }
        element.className += ' selected-shape';
    }

    function changeColor(id, alpha) {
        var ctx = find(id.id).getContext('2d');
        context.lineWidth = 2;
        context.strokeStyle = '#6c96c8';
        let nimage = new Image();

        nimage.onload = () => {
            ctx.globalAlpha = alpha;
            ctx.clearRect(0, 0, 40, 40);
            ctx.drawImage(nimage, 0, 0, 28, 28);
        };
        nimage.src = id.toDataURL();
    }

    function returnColor(id) {
        if (!id)
            return;

        try {

            var ctx = find(id.id).getContext('2d');
            context.lineWidth = 2;
            context.strokeStyle = '#6c96c8';
            let nimage = new Image();
            nimage.onload = () => {
                ctx.globalAlpha = 1;
                ctx.clearRect(0, 0, 40, 40);
                ctx.drawImage(nimage, 0, 0, 28, 28);
            }
            nimage.src = data_uris[id.id];
        }
        catch {

        }
    }
    /* Default: setting default selected shape!! */
    is.set(window.selectedIcon);

    window.addEventListener('load', function () {
        setSelection(find('pencilIcon'), window.selectedIcon);
    }, false);

    (function () {
        var cache = {};

        decorateUndo();
        decorateFull();
        decorate3dview();
        decorateFile();
        decoratecallteacher();
        decorateHomework();
        decoratemovie();
        decoratePencil();
        decorateMarker();
        decorateEraser();
        decorateText();
        decorateclearCanvas();
        decorateScreenShare();
        decoratEpub();
        decorateonoff();

        function getContext(id) {
            var context = find(id).getContext('2d');
            context.lineWidth = 2;
            context.strokeStyle = '#6c96c8';
            return context;
        }

        function bindEvent(context, shape) {
            addEvent(context.canvas, 'click', function () {
                if (shape === 'Text') {
                    if (this.classList.contains("off"))
                        return false;
                    textHandler.onShapeSelected();
                } else {
                    textHandler.onShapeUnSelected();
                }

                setSelection(this, shape);

                if (this.id === 'eraserIcon') {
                    if (this.classList.contains('off')) return false;
                    BtnOff();
                    tempCanvas.className = "";
                    tempCanvas.classList.add("eraser");
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
            image.onload = function () {
                context.drawImage(image, 0, 0, 28, 28);
                changeColor(find('undo'), 0.3);
                find('undo').onclick = function () {
                    undo();
                };
            };
            image.src = data_uris.undo;
        }

        function decorateFull() {
            let image = new Image();
            image.onload = () => {
                getContext('full').drawImage(image, 0, 0, 28, 28);
            };

            image.src = data_uris.fullon;
        }

        function decorate3dview() {
            var image = new Image();
            image.onload = () => {
                getContext('3d_view').drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.view3d;
        }

        function decorateHomework() {
            let image = new Image();
            image.onload = () => {
                getContext('homework').drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.homework;
        }

        function decoratemovie() {
            let image = new Image();
            image.onload = () => {
                getContext('movie').drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.movie;

            // find('movie').onclick = function () {
            //     this.classList.toggle("on");
            //     this.classList.toggle("selected-shape");
            // }
        }

        function decoratecallteacher() {
            let image = new Image();
            image.onload = () => {
                getContext('callteacher').drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.callteacher;
        }

        function decorateFile() {
            let image = new Image();
            image.onload = () => {
                getContext('file').drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.file;
        }

        function decoratePencil() {
            function hexToRGBA(h) {
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
                btnPencilDone = find('pencil-done'),
                canvas = context.canvas;

            pencilStrokeStyle = hexToRGBA("#484848")

            addEvent(canvas, 'click', function () {
                hideContainers();
                BtnOff();

                if (this.classList.contains('off')) return false;
                tempCanvas.className = "pen";
                pencilContainer.style.display = 'block';
                pencilContainer.style.top = (canvas.offsetTop) + 'px';
                pencilContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) - 2 + 'px';
            });

            addEvent(btnPencilDone, 'click', () => {
                pencilContainer.style.display = 'none';
                pencilLineWidth = strokeStyleText.value;
            });
        }

        function decorateMarker() {
            function hexToRGBA(h, alpha) {
                return 'rgba(' + hexToRGB(h).join(',') + ',' + alpha + ')';
            }

            var context = getContext('markerIcon');

            var image = new Image();
            image.onload = function () {
                context.drawImage(image, 0, 0, 28, 28);
                bindEvent(context, 'Marker');
            };
            image.src = data_uris.markerIcon;

            var strokeStyleText = find('marker-stroke-style'),
                btnMarkerDone = find('marker-done'),
                canvas = context.canvas,
                alpha = 0.2;

            markerStrokeStyle = hexToRGBA("#F12A2A", alpha)

            addEvent(canvas, 'click', function () {
                if (this.classList.contains('off'))
                    return false;
                hideContainers();
                BtnOff();

                tempCanvas.className = "marker";
                markerContainer.style.display = 'block';
                markerContainer.style.top = (canvas.offsetTop + 1) + 'px';
            });

            addEvent(btnMarkerDone, 'click', () => {
                markerContainer.style.display = 'none';
                markerLineWidth = strokeStyleText.value;
            });


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

        function decorateText() {
            var context = getContext('textIcon');
            var image = new Image();
            image.onload = () => {
                context.drawImage(image, 0, 0, 28, 28);
                bindEvent(context, 'Text');
            };
            image.src = data_uris.textIcon;
        }

        function decorateclearCanvas() {
            var context = getContext('clearCanvas');

            var image = new Image();
            image.onload = () => {
                context.drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.clearCanvas;

            find('clearCanvas').onclick = function () {
                if (this.classList.contains('off') || points.length < 1)
                    return false;

                orderHistory = [];
                orderHistoryChecker();
                window.parent.currentPoints = []
                window.parent.currentHistory = []

                points = []
                pointHistory = [];
                drawHelper.redraw();

                syncPoints(true, "clear");
            };
        }

        function decorateScreenShare() {
            var image = new Image();
            image.onload = () => {
                getContext('screen_share').drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.screenShare;
        }

        function decoratEpub() {
            var image = new Image();
            image.onload = () => {
                getContext('epub').drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.epub;
        }

        function decorateonoff() {
            let context = getContext('onoff-icon');
            let image = new Image();
            image.onload = () => {
                context.clearRect(0, 0, 40, 40);
                context.drawImage(image, 0, 0, 28, 28);
            };
            image.src = data_uris.on;

            find('onoff-icon').onclick = function () {
                this.classList.toggle("on");
                let isOn = this.classList.contains("on");

                if (isOn) {
                    image.src = data_uris.on;
                    let icons = find('tool-box').children;
                    for (let i = 0; i < icons.length; i++) {
                        if (!icons[i].classList.contains('draw') || icons[i].id == 'onoff-icon')
                            continue;

                        if (icons[i].id != "undo" || orderHistory.length != 0)
                            returnColor(icons[i]);

                        icons[i].classList.remove("off");
                        icons[i].classList.add("on");
                    }
                    find("main-canvas").style.display = 'block';
                    tempCanvas.style.display = 'block';
                }
                else {
                    image.src = data_uris.off;
                    let icons = find('tool-box').children;
                    for (let i = 0; i < icons.length; i++) {

                        if (!icons[i].classList.contains('draw') || icons[i].id == 'onoff-icon')
                            continue;

                        if (icons[i].style.display == 'block') {
                            if (icons[i].id != "undo" || orderHistory.length != 0) {
                                changeColor(icons[i], 0.3);
                            }

                            icons[i].classList.remove("on");
                            icons[i].classList.add("off");
                        }
                    }

                    find("main-canvas").style.display = 'none';
                    tempCanvas.style.display = 'none';
                    pencilContainer.style.display = 'none';
                    find("marker-container").style.display = 'none';
                }

            };
        }
    })();

    function hideContainers() {
        markerContainer.style.display =
            pencilContainer.style.display = 'none';
    }

    function BtnOff() {
        window.parent.document.getElementsByClassName("selected-shape")[0].classList.remove("selected-shape");
    }

    function TouchConverter(e) {
        var r = {
            pageX: e.touches[0].pageX,
            pageY: e.touches[0].pageY,
        }
        return r;
    }

    addEvent(canvas, 'touchstart mousedown', function (e) {

        if(zoom.isSpace)
            return;


        if (e.touches) {


            if (e.touches.length >= 2) {
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

                if (!cache.isEraser) {
                    syncPoints(false, command);
                }

                preventStopEvent(e);
                return;
            }

            e = TouchConverter(e);
        }

        var cache = is;
        window.parent.document.getElementById("student-menu").style.display = 'none';
        if (cache.isPencil) pencilHandler.mousedown(e);
        else if (cache.isEraser) eraserHandler.mousedown(e);
        else if (cache.isText) textHandler.mousedown(e);
        else if (cache.isMarker) markerHandler.mousedown(e);

        preventStopEvent(e);
    });

    function preventStopEvent(e) {
        if (!e) {
            return;
        }

        if (typeof e.preventDefault === 'function') {
            if (e.cancleable)
                e.preventDefault();
        }

        if (typeof e.stopPropagation === 'function') {
            e.stopPropagation();
        }
    }

    addEvent(canvas, 'touchend mouseup', function (e) {
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

        if (!cache.isEraser) {
            syncPoints(false, command);
        }

        preventStopEvent(e);
    });

    addEvent(canvas, 'touchmove mousemove', function (e) {
        if (e.touches) {
            e = TouchConverter(e);
        }

        if (is.isPencil) pencilHandler.mousemove(e);
        else if (is.isEraser) eraserHandler.mousemove(e);
        else if (is.isText) textHandler.mousemove(e);
        else if (is.isMarker) markerHandler.mousemove(e);

        preventStopEvent(e);
    });

    var keyCode;
    var lastPointIndex = 0;
    var uid;

    addEvent(document, 'keydown', (e) => {
        keyCode = e.which || e.keyCode || 0;
    });

    addEvent(window.parent.document, 'keyup', (e) => {
        if (e.which == null && (e.charCode != null || e.keyCode != null)) {
            e.which = e.charCode != null ? e.charCode : e.keyCode;
        }
        keyCode = e.which || e.keyCode || 0;
        if (keyCode === 13 && is.isText) {
            textHandler.onReturnKeyPressed();
            return;
        }

        if (keyCode === 90 && e.ctrlKey) {
            undo();
        }
    });

    addEvent(document, 'keypress', (e) => {
        if (e.which == null && (e.charCode != null || e.keyCode != null)) {
            e.which = e.charCode != null ? e.charCode : e.keyCode;
        }
        keyCode = e.which || e.keyCode || 0;
    });


    window.addEventListener('message', function (event) {
        if (!event.data) return;

        if (!uid) {
            uid = event.data.uid;
        }

        if (event.data.syncPoints) {
            syncPoints(true);
            return;
        }

        if (!event.data.canvasDesignerSyncData)
            return;

        let data = event.data.canvasDesignerSyncData;

        if (data.isStudent) {
            let id = data.userid;
            if (id) {
                if (!studentPoints[id] || data.isSyncAll)
                    studentPoints[id] = []
                PushPoints(data, studentPoints[id]);
            }
            else {
                Object.keys(studentPoints).forEach(function (key) {
                    studentPoints[key].length = 0;
                })
            }
        }
        else {
            if (data.isSyncAll) {
                teacherPoints = [];
            }
            PushPoints(data, teacherPoints);
        }

        lastPointIndex = points.length;
        drawHelper.redraw();
    }, false);


    function PushPoints(data, array) {
        if (data.canvassend)
            array.length = 0;

        switch (data.command) {
            case "undo":
                array.splice(-1)
                break;
            case "eraser":
                array.splice(data.idx, 1);
                break;
            case "clear":
                array.length = 0;
                break;
            case "my":
                points = data.points;
                pointHistory = data.history;
                window.parent.currentPoints = points;
                window.parent.currentHistory = pointHistory;
                break;
            case "default":
            case "loaddata":
                var startIdx = 0;
                data.history.forEach(function (history) {
                    if (startIdx == history)
                        return false;
                    var points = data.points.slice(startIdx, history);
                    var command = points[0][0];
                    var startIndex = startIdx;
                    startIdx = history;

                    var d = {
                        points: points,
                        command: command,
                        startIndex: startIndex,
                        userid: data.userid,
                    }
                    array.push(d);
                })
                break;
            case "load":
                array.length = 0;
                data.history.forEach(function (history) {
                    if (startIdx == history)
                        return false;
                    let points = data.points.slice(startIdx, history);
                    let command = points[0][0];
                    let startIndex = startIdx;
                    startIdx = history;

                    let d = {
                        points: points,
                        command: command,
                        startIndex: startIndex,
                        userid: data.userid,
                    }
                    array.push(d);
                })
                break;
            case "clearcanvas":
                points.length = 0;
                pointHistory.length = 0
                window.parent.currentPoints = points;
                window.parent.currentHistory = pointHistory;
            case "clearteacher":
            case "clearstudent":
                array.length = 0;
                break;
            default:
                array.push(data);
        }
    }

    function syncData(data) {
        data.pageidx = window.parent.pointer_saver.nowIdx;
        data.userid = _uid;
        data.history = pointHistory;
        data.startIndex = points.length;
        lastPointIndex = points.length;
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

        let pointsToShare = [];
        for (let i = lastPointIndex; i < points.length; i++) {
            pointsToShare[i - lastPointIndex] = points[i];
        }

        syncData({
            isSyncAll: isSyncAll,
            points: pointsToShare || [],
            command: command,
            startIndex: lastPointIndex
        });

        if (!pointsToShare.length && points.length) return;
        lastPointIndex = points.length;
    }

    let c = document.getElementsByClassName("i");
    for (let i = 0; i < c.length; i++) {
        c[i].addEventListener("click", function () {
            find("marker-container").style.display = 'none';
            pencilContainer.style.display = 'none';
        })
    }

    SliderSetting("pencileslider", "pencil-stroke-style", 1, 22, 3, function (v) {
        clone(drawHelper).getOptions = () => {
            return [pencilLineWidth, pencilStrokeStyle, fillStyle, globalAlpha, font];
        }
        pencilLineWidth = v;
    });
    SliderSetting("markerslider", "marker-stroke-style", 14, 40, 21, function (v) {
        clone(drawHelper).getOptions = () => {
            return [markerLineWidth, markerStrokeStyle, fillStyle, globalAlpha, font];
        }
        markerLineWidth = v;
    });
    ColorSetting('pencil-container', penColors);
    ColorSetting('marker-container', penColors);

    function ColorSetting(_container, colors) {
        let container = find(_container);
        let template = container.getElementsByClassName("color_template")[0];
        let divs = [];

        function hexToRGBA(h, alpha) {
            return 'rgba(' + hexToRGB(h).join(',') + ',' + alpha + ')';
        }

        colors.forEach(function (color) {
            let div = document.createElement("div");
            div.dataset.color = color;
            div.className = "color";
            div.style.backgroundColor = color;
            divs.push(div);
            template.appendChild(div);
        });

        for (let i = 0; i < divs.length; i++) {
            divs[i].addEventListener("click", function () {
                let nowColor = this.dataset.color;
                divs.forEach(element => element.classList.remove("on"));
                this.classList.add("on");
                if (_container == "pencil-container")
                    pencilStrokeStyle = nowColor;
                else if (_container == "marker-container")
                    markerStrokeStyle = hexToRGBA(nowColor, 0.2);
            })
        }
    }

    function undo() {
        if (orderHistory.length == 0)
            return;

        let command = orderHistory[orderHistory.length - 1];
        if (command == 'undo') {
            if (points.length) {
                let idx = pointHistory.length - 2;
                idx == -1 ? points = [] : points.length = pointHistory[idx];
                pointHistory.pop();
                drawHelper.redraw();
            }
            syncPoints(false, "undo");
        }
        else {
            let idx = Object.keys(command)[0];
            let newPoints = command[idx];
            let position = -1;

            for (let i = 0; i < pointHistory.length; i++) {
                idx < pointHistory[i] ? pointHistory[i] += newPoints.length :
                    position = i;
            }

            let prenum = position == -1 ? 0 : pointHistory[position];
            pointHistory.splice(position + 1, 0, prenum + newPoints.length);
            points.splice.apply(points, [pointHistory[position], 0].concat(newPoints));

            drawHelper.redraw();
            syncPoints(false, newPoints[0][0]);
        }
        orderHistory.pop();
        orderHistoryChecker();
    }
})();

// -----------------------------------------------------------------------



function MakeTitlePop(element, contents) {
    let ele = find(element);
    let pop = find("titlebox");

    if (!ele)
        return;

    ele.addEventListener("mouseover", function () {
        if (this.classList.contains("off"))
            return false;

        pop.style.display = 'block';
        let rect = ele.getBoundingClientRect();
        let y = rect.y;
        let height = 7;
        pop.style.top = y + height + 'px';
        pop.children[0].innerHTML = contents;
    })

    ele.addEventListener("mouseleave", function () {
        pop.style.display = 'none';
    })
}


function SliderSetting(element, targetinput, min, max, defaultv, callback) {
    max -= min;

    let slider = window.parent.document.getElementById(element);
    let bar = slider.getElementsByClassName("slider_btn")[0];
    let back = slider.getElementsByClassName("slider-back")[0];
    let sliderval = window.parent.document.getElementById(targetinput);
    let isClick = false;

    Set(defaultv);

    function Set(v) {
        slider.parentElement.style.display = "block";
        let ratio = (v - min) / max;
        let sliderWidth = slider.getBoundingClientRect().width;
        back.style.width = (ratio * sliderWidth) + 'px';
        bar.style.left = (ratio * sliderWidth) - bar.getBoundingClientRect().width / 2 + 'px';
        sliderval.value = (max * ratio).toFixed(0) * 1 + min;
        slider.parentElement.style.display = "none";
        callback(v);
    }

    bar.addEventListener("mousedown", function () {
        isClick = true;
    })


    window.addEventListener("mousemove", function (e) {
        if (isClick) {
            let sliderLeft = slider.getBoundingClientRect().left;
            let sliderWidth = slider.getBoundingClientRect().width;
            let ratio = (e.x - sliderLeft) / sliderWidth;
            ratio = Math.min(Math.max(0, ratio), 1);
            back.style.width = (ratio * sliderWidth) + 'px';
            bar.style.left = (ratio * sliderWidth) - bar.getBoundingClientRect().width / 2 + 'px';
            sliderval.value = (max * ratio).toFixed(0) * 1 + min;
        }
    })

    document.getElementById("temp-canvas").addEventListener("mouseup", function () {
        if (isClick) {
            isClick = false;
            callback(sliderval.value);
        }
    })

    window.addEventListener("mouseup", function () {
        if (isClick) {
            isClick = false;
            callback(sliderval.value);
        }
    })

    slider.addEventListener("mousedown", function (e) {
        let sliderWidth = slider.getBoundingClientRect().width;
        let mousex = e.offsetX;
        isClick = true;

        if (e.target == bar) {
            return false;
        }
        let ratio = mousex / sliderWidth;
        ratio = Math.min(Math.max(0, ratio), 1);
        back.style.width = (ratio * sliderWidth) + 'px';
        bar.style.left = (ratio * sliderWidth) - bar.getBoundingClientRect().width / 2 + 'px';
        sliderval.value = (max * ratio).toFixed(0) * 1 + min;
    })
}

function handleDragDropEvent(oEvent) {
    oEvent.preventDefault();
}



