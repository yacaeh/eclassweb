class epubManagerClass {
    constructor() {
        this.isEpubViewer = false;
        this.path = undefined;
        this.renditionBuffer = undefined;
    }

    loadEpubViewer(url) {
        canvasManager.clearCanvas();
        pageNavigator.on();

        classroomInfo.epub.state = true;
        this.isEpubViewer = true;
        console.log("Load Epub viewer");

        widgetContainer.style.width - 50;

        let epubDiv = document.createElement('div');
        epubDiv.className = 'epub-top';
        epubDiv.id = 'epub-top'

        let epubViewer = document.createElement('div');
        epubViewer.setAttribute('id', 'epub-viewer');
        epubViewer.setAttribute('class', 'spread');
        epubViewer.style.width = '100%';

        let loadingIcon = document.createElement("img");
        loadingIcon.src = "/dashboard/img/loading.gif";
        loadingIcon.style.position = 'absolute';
        loadingIcon.style.zIndex = '-1';
        
        epubDiv.appendChild(epubViewer)
        epubDiv.appendChild(loadingIcon);
        GetWidgetFrame().document.getElementById('design-surface').appendChild(epubDiv);

        var book = ePub(url);
        window.book = book;

        this.path = book.url.href;
        console.log(this.path);
        pointer_saver.load_container(this.path);

        var rendition = book.renderTo(epubViewer, {
            flow: 'paginated',
            position : 'absolute',
            width: '100%',
            height : '100%',
            minSpreadWidth: '450px',
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

        book.loaded.navigation.then(function (toc) {
            pageNavigator.set(book.spine.length);
            pageNavigator.epubsetting();
            Object.keys(book.package.manifest).forEach(function (e) {
                let href = book.package.manifest[e].href;
                if (href.includes("thumbnail")) {
                    reactEvent.navigation.push(book.url.origin + book.path.directory + href, (e) =>{
                        rendition.display(e.target.getAttribute("idx"));
                    })
                }
            })
        });

        rendition.on('relocated', function (locations) {
            let doc = epubViewer.getElementsByTagName('iframe')[0].contentWindow.document;
            doc.documentElement.style.display = 'flex';
            doc.documentElement.style.justifyContent = 'center';
            doc.documentElement.style.height = '100%';
            pointer_saver.save()
            pointer_saver.load(locations.start.index);
            pageNavigator.select(locations.start.index);
            classroomCommand.sendEpubCmd('page', {
                page: locations.start.index
            });
        });
    }

    unloadEpubViewer() {
        pointer_saver.save_container();
        console.debug("Epub Off");
        classroomInfo.epub.page = 0;
        pointer_saver.nowIdx = 0;
        canvasManager.clear();
        pageNavigator.off();
        classroomInfo.epub.state = false;
        this.isEpubViewer = false;
        this.renditionBuffer = null;
        try{
            GetWidgetFrame().document.getElementById('epub-top').remove();
        }
        catch(e){

        }
    }
}