isEpubViewer = false;
var renditionBuffer;

function LoadEpub(btn) {
    if (!isSharingEpub && checkSharing()) {
        removeOnSelect(btn);
        return;
    }

    if (!connection.extra.roomOwner) return;

    if (isEpubViewer === false) {
        isSharingEpub = true;
        loadEpubViewer();
        $('#canvas-controller').show();
        isEpubViewer = true;
        classroomCommand.sendOpenEpub();


    } else {
        isSharingEpub = false;
        unloadEpubViewer();
        $('#canvas-controller').hide();
        isEpubViewer = false;
        classroomCommand.sendCloseEpub();
    }
}

function EpubPositionSetting() {
    var viewer = GetWidgetFrame().document.getElementById("epub-viewer");
    var can = GetWidgetFrame().document.getElementById("main-canvas");
    var wrapsize = viewer.getElementsByTagName("iframe")[0].contentWindow.document.getElementsByClassName("wrap")[0].getBoundingClientRect();
    viewer.style.left = Math.max(50, (can.width * 0.5) - (wrapsize.width * 0.5)) + "px";
}

function loadEpubViewer() {
    ClearCanvas();
    PointerSaver.load(0);

    PageNavigator.on();

    isSharingEpub = true;
    isEpubViewer = true;
    console.log("Load Epub viewer");

    document.getElementById("widget-container").style.width - 50;

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

    var book = ePub(
        'https://files.primom.co.kr:1443/uploads/epub/6da5303c-d218-67f1-8db1-2a8e5d2e5936/Lesson1.epub/ops/content.opf'
    );
    window.book = book;
    var rendition = book.renderTo(epubViewer, {
        flow: 'paginated',
        height: "100%",
        minSpreadWidth: '768px',
        snap: true
    });

    window.rendition = rendition;
    renditionBuffer = rendition;

    var displayed;
    if (connection.extra.roomOwner)
        displayed = rendition.display();
    else {
        if (classroomInfo.epub.page)
            displayed = rendition.display(classroomInfo.epub.page);
        else
            displayed = rendition.display();
    }


    displayed.then(function (renderer) {
    });

    // Navigation loaded
    book.loaded.navigation.then(function (toc) {
        var len = book.spine.length;
        PageNavigator.set(len);

        let origin = book.url.origin;
        let path = book.path.directory;
        let location = origin + path;

        PageNavigator.epubsetting();

        Object.keys(book.package.manifest).forEach(function (e) {
            var href = book.package.manifest[e].href;
            if (href.includes("thumbnail")) {
                var img = document.createElement("img");
                img.src = location + href;
                PageNavigator.push(img, function () {
                    rendition.display(this.getAttribute("idx"));
                })
            }
        })
    });

    rendition.on('relocated', function (locations) {
        PointerSaver.save()
        PointerSaver.load(locations.start.index);
        PageNavigator.select(locations.start.index);
        classroomCommand.sendEpubCmd('page', {
            page: locations.start.index
        });
        EpubPositionSetting();
    });

    var keyListener = function (e) {
        // Left Key
        if ((e.keyCode || e.which) == 37) {
            prevPage();
        }

        // Right Key
        if ((e.keyCode || e.which) == 39) {
            nextPage()
        }
    };

    function nextPage() {
        rendition.next();
    }

    function prevPage() {
        rendition.prev();
    }

    rendition.on('keyup', keyListener);
    document.addEventListener('keyup', keyListener, false);
}

function unloadEpubViewer() {
    ClearCanvas();
    ClearTeacherCanvas();
    ClearStudentCanvas();

    PointerSaver.close();
    PageNavigator.off();

    isSharingEpub = false;
    isEpubViewer = false;

    renditionBuffer = null;

    let frame = GetWidgetFrame();
    frame.document.getElementById('main-canvas').style.zIndex = '1';
    frame.document.getElementById('temp-canvas').style.zIndex = '2';
    frame.document.getElementById('tool-box').style.zIndex = '3';

    frame.document.getElementById('epub-viewer').remove();
    frame.document.getElementById('loading-window').remove();
}
