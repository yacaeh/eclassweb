class epubManagerClass {
    constructor() {
        this.isEpubViewer = false;
        this.path = undefined;
        this.renditionBuffer = undefined;
    }

    loadEpub(btn) {
        if (!isSharingEpub && checkSharing()) {
            removeOnSelect(btn);
            return;
        }

        if (epubManager.isEpubViewer === false) {
            isSharingEpub = true;
            epubManager.isEpubViewer = true;
            epubManager.loadEpubViewer();
            classroomCommand.sendOpenEpub();
        } else {
            isSharingEpub = false;
            epubManager.isEpubViewer = false;
            epubManager.unloadEpubViewer();
            $('#canvas-controller').hide();
            classroomCommand.sendCloseEpub();
        }
    }
    EpubPositionSetting() {
        let viewer = GetWidgetFrame().document.getElementById("epub-viewer");
        let can = GetWidgetFrame().document.getElementById("main-canvas");
        let wrapsize = viewer.getElementsByTagName("iframe")[0].contentWindow.document.getElementsByClassName("wrap")[0].getBoundingClientRect();
        viewer.style.left = Math.max(50, (can.width * 0.5) - (wrapsize.width * 0.5)) + "px";
    }
    loadEpubViewer() {
        canvasManager.clearCanvas();
        pageNavigator.on();

        isSharingEpub = true;
        this.isEpubViewer = true;
        console.log("Load Epub viewer");

        widgetContainer.style.width - 50;

        let epubViewer = document.createElement('div');
        epubViewer.setAttribute('id', 'epub-viewer');
        epubViewer.setAttribute('class', 'spread');

        let loadingWindow = document.createElement("div");
        loadingWindow.setAttribute('id', 'loading-window');
        let loadingIcon = document.createElement("img");
        loadingIcon.src = "/dashboard/img/loading.gif";
        loadingIcon.className = "loading";
        loadingWindow.appendChild(loadingIcon);

        let frame = GetWidgetFrame();

        frame.document.getElementsByClassName('design-surface')[0].appendChild(loadingWindow);
        frame.document.getElementsByClassName('design-surface')[0].appendChild(epubViewer);

        frame.document.getElementById('main-canvas').style.zIndex = '1';
        frame.document.getElementById('temp-canvas').style.zIndex = '2';
        frame.document.getElementById('tool-box').style.zIndex = '3';

        var book = ePub('https://files.primom.co.kr:1443/uploads/epub/6da5303c-d218-67f1-8db1-2a8e5d2e5936/Lesson1.epub/ops/content.opf');
        window.book = book;

        this.path = book.url.href;
        pointer_saver.load_container(this.path);

        var rendition = book.renderTo(epubViewer, {
            flow: 'paginated',
            height: "100%",
            minSpreadWidth: '768px',
            snap: true
        });

        window.rendition = rendition;
        this.renditionBuffer = rendition;

        var displayed;
        if (connection.extra.roomOwner)
            displayed = rendition.display();
        else {
            classroomInfo.epub.page ? displayed = rendition.display(classroomInfo.epub.page) : displayed = rendition.display();
        }

        displayed.then(function (renderer) {
        });

        // Navigation loaded
        book.loaded.navigation.then(function (toc) {
            var len = book.spine.length;
            pageNavigator.set(len);

            let origin = book.url.origin;
            let path = book.path.directory;
            let location = origin + path;

            pageNavigator.epubsetting();

            Object.keys(book.package.manifest).forEach(function (e) {
                let href = book.package.manifest[e].href;
                if (href.includes("thumbnail")) {
                    let img = document.createElement("img");
                    img.src = location + href;
                    pageNavigator.push(img, function () {
                        rendition.display(this.getAttribute("idx"));
                    })
                }
            })
        });

        rendition.on('relocated', function (locations) {
            pointer_saver.save()
            pointer_saver.load(locations.start.index);
            pageNavigator.select(locations.start.index);
            classroomCommand.sendEpubCmd('page', {
                page: locations.start.index
            });
            epubManager.EpubPositionSetting();
        });

        var keyListener = function (e) {
            // Left Key
            if ((e.keyCode || e.which) == 37)
                rendition.prev();
            // Right Key
            if ((e.keyCode || e.which) == 39)
                rendition.next();
        };

        rendition.on('keyup', keyListener);
        document.addEventListener('keyup', keyListener, false);
    }
    unloadEpubViewer() {
        pointer_saver.save_container();

        canvasManager.clear();
        pageNavigator.off();

        isSharingEpub = false;
        this.isEpubViewer = false;
        this.renditionBuffer = null;
        let frame = GetWidgetFrame();

        frame.document.getElementById('main-canvas').style.zIndex = '1';
        frame.document.getElementById('temp-canvas').style.zIndex = '2';
        frame.document.getElementById('tool-box').style.zIndex = '3';
        frame.document.getElementById('epub-viewer').remove();
        frame.document.getElementById('loading-window').remove();
    }
}