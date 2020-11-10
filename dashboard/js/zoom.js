class ZoomManager {
    constructor(target) {
        let _this = this;

        // Initialize --------------------------------------
        this.width = target.getBoundingClientRect().width;
        this.height = target.getBoundingClientRect().height;
        this.target = target;
        this.zoomLevel = 1;
        this.currentPosX = 0;
        this.currentPosY = 0;
        this.maxZoomLevel = 5;

        // Desktop --------------------------------------
        this.isSpace = false;
        this.isMouseDown = false;
        this.preMousePosX = 0;
        this.preMousePosY = 0;

        // Touch ---------------------------------
        this.fingers = 0;
        this.lastdist = 0;
        this.startdist = 0;
        this.touchStartPosX = 0;
        this.touchStartPosY = 0;
        this.lastScale = 1;

        this.startTouches = undefined;


        window.addEventListener("resize", () => {
            _this.width = target.getBoundingClientRect().width / _this.zoomLevel;
            _this.height = target.getBoundingClientRect().height / _this.zoomLevel;
        })
    }

    getDistance(p1, p2) {
        let x = p2.x - p1.x;
        let y = p2.y - p1.y;
        return Math.sqrt(x * x + y * y);
    }
    
    sum(a, b) {
        return a + b;
    };

    getVectorAvg(vectors) {
        return {
            x: vectors.map(function (v) {
                return v.x;
            }).reduce(this.sum) / vectors.length,
            y: vectors.map(function (v) {
                return v.y;
            }).reduce(this.sum) / vectors.length
        };
    };

   getTouchCenter(touches) {
        return this.getVectorAvg(touches);
    };

    getTouches(event) {
        var rect = this.target.getBoundingClientRect();
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
        var posTop = rect.top + scrollTop;
        var posLeft = rect.left + scrollLeft;
        return Array.prototype.slice.call(event.touches).map(function (touch) {
            return {
                x: touch.screenX,
                y: touch.screenY 
            };
        });
    };

    targetTouches(touches){
        return Array.from(touches).map(function (touch) {
            return {
                x: touch.screenX,
                y: touch.screenY
            };
        });
    }

    handleZoom(event, newScale) {
        var touchCenter = this.getTouchCenter(this.getTouches(event)),
            scale = newScale * this.lastScale;
            console.log(scale , newScale, this.lastScale);
        // this.lastScale = scale;

        //     this.nthZoom += 1;
        // if (this.nthZoom > 3) {

        //     this.scale(scale, touchCenter);
        //     this.drag(touchCenter, this.lastZoomCenter);
        // }
        // console.log("touch Center : ", touchCenter);
        // console.log(scale,newScale,this.lastScale);
        this.lastZoomCenter = touchCenter;
        return scale;
    };

    calculateScale(startTouches, endTouches) {
        var startDistance = this.getDistance(startTouches[0], startTouches[1]),
            endDistance = this.getDistance(endTouches[0], endTouches[1]);
        return endDistance / startDistance;
    }

    setEvent(element) {
        let _this = this;

        // Touch ---------------------------------

        element.addEventListener("touchstart", function (e) {
            _this.fingers = e.touches.length;

            if (_this.fingers == 2) {
                _this.lastScale = _this.zoomLevel;
                _this.startTouches = _this.targetTouches(e.touches);
            }
            else if (_this.fingers == 3) {
                let xSum = 0;
                let ySum = 0;

                for (let i = 0; i < e.touches.length; i++) {
                    xSum += e.touches[i].screenX;
                    ySum += e.touches[i].screenY;
                }
                let mousePosX = xSum / 3;
                let mousePosY = ySum / 3;

                _this.preMousePosX = mousePosX;
                _this.preMousePosY = mousePosY;
            }
        })

        element.addEventListener('touchend', function (event) {
            _this.fingers = event.touches.length;
            if(_this.fingers == 0)
                console.log("end");

        });

        element.addEventListener("touchmove", function (e) {
            if (_this.fingers == 2) {

                let scale = _this.handleZoom(e, _this.calculateScale(_this.startTouches, _this.targetTouches(e.touches)));
                scale = _this.clamp(scale, 1, _this.maxZoomLevel);
                _this.setLevel(scale);

                _this.boundCheck();
                _this.setPosistion();
                _this.render();
                return;
            }
            else if (_this.fingers == 3) {
                let xSum = 0;
                let ySum = 0;

                for (let i = 0; i < e.touches.length; i++) {
                    xSum += e.touches[i].screenX;
                    ySum += e.touches[i].screenY;
                }

                let mousePosX = xSum / 3;
                let mousePosY = ySum / 3;
                let x = _this.preMousePosX - mousePosX;
                let y = _this.preMousePosY - mousePosY;
                _this.preMousePosX = mousePosX;
                _this.preMousePosY = mousePosY;
                _this.currentPosX -= x;
                _this.currentPosY -= y;
                _this.boundCheck();
                _this.setPosistion();
                return;
            }

        })

        //------------------------------------------

        element.addEventListener("mousedown", function (e) {
            if (e.button == 0 && _this.isSpace) {
                _this.isMouseDown = true;
                _this.preMousePosX = e.screenX - window.screenLeft;
                _this.preMousePosY = e.screenY - window.screenTop;
            }
        })

        element.addEventListener("mousemove", function (e) {
            if (_this.isMouseDown) {
                let mousePosX = e.screenX - window.screenLeft;
                let mousePosY = e.screenY - window.screenTop;
                let x = _this.preMousePosX - mousePosX;
                let y = _this.preMousePosY - mousePosY;
                _this.preMousePosX = mousePosX;
                _this.preMousePosY = mousePosY;
                _this.currentPosX -= x;
                _this.currentPosY -= y;
                _this.boundCheck();
                _this.setPosistion();
            }
        })

        element.addEventListener("mouseup", function (e) {
            if (e.button == 0) {
                _this.isMouseDown = false;
            }
        })

        element.addEventListener("wheel", function (e) {
            let targetzoomLevel = _this.zoomLevel;
            if (e.deltaY < 0) {
                targetzoomLevel += 0.1
                if (_this.maxZoomLevel < targetzoomLevel)
                    return;
            }
            else {
                targetzoomLevel -= 0.1
                if (1 > targetzoomLevel)
                    return;
            }
            targetzoomLevel = _this.clamp(targetzoomLevel, 1, _this.maxZoomLevel);

            let mousePosX = e.screenX - window.screenLeft;
            let mousePosY = e.screenY - window.screenTop;

            if (e.deltaY < 0) {
                _this.zoomIn(mousePosX, mousePosY);
            }
            else {
                _this.zoomOut();
            }

            _this.setLevel(targetzoomLevel);
            _this.boundCheck();
            _this.setPosistion();
            _this.render();
        })

        window.addEventListener("keydown", (e) => {
            if (e.code == 'Space') {
                _this.isSpace = true;
                element.style.cursor = 'grab';
            }
        })

        window.addEventListener("keyup", (e) => {
            if (e.code == 'Space') {
                _this.isSpace = false;
                element.style.cursor = '';
            }
        })
    }

    zoomIn(x, y) {
        let viewX = x / this.width;
        let viewY = y / this.height;
        let xpower = Math.abs(viewX - 0.5) * 150;
        let ypower = Math.abs(viewY - 0.5) * 150;

        if (viewX < 0.5) {
            this.currentPosX += xpower;
        }
        else {
            this.currentPosX -= xpower;
        }

        if (viewY < 0.5) {
            this.currentPosY += ypower;
        }
        else {
            this.currentPosY -= ypower;
        }
    }

    zoomOut() {
        let remainLevel = (this.zoomLevel - 1) * 10;
        let rx = this.currentPosX / remainLevel;
        let ry = this.currentPosY / remainLevel;
        this.currentPosX -= rx;
        this.currentPosY -= ry;
    }

    getLevel() {
        return this.zoomLevel;
    }

    setLevel(level) {
        this.zoomLevel = level;
    }

    boundCheck() {
        let left = this.width * this.zoomLevel / 2 - this.width / 2;
        let top = this.height * this.zoomLevel / 2 - this.height / 2;
        this.currentPosX = this.clamp(this.currentPosX, -left, left);
        this.currentPosY = this.clamp(this.currentPosY, -top, top);
    }

    clamp(value, min, max) {
        return Math.min(Math.max(min, value), max) || 0;
    }

    setPosistion() {
        this.target.style.left = this.currentPosX + 'px';
        this.target.style.top = this.currentPosY + 'px';
    }

    render() {
        this.target.style.transform = "scale(" + this.zoomLevel + ")";
    }
}
