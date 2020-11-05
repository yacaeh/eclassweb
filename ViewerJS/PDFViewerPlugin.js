/**
 * Copyright (C) 2013-2015 KO GmbH <copyright@kogmbh.com>
 *
 * @licstart
 * This file is part of ViewerJS.
 *
 * ViewerJS is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License (GNU AGPL)
 * as published by the Free Software Foundation, either version 3 of
 * the License, or (at your option) any later version.
 *
 * ViewerJS is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with ViewerJS.  If not, see <http://www.gnu.org/licenses/>.
 * @licend
 *
 * @source: http://viewerjs.org/
 * @source: http://github.com/kogmbh/ViewerJS
 */

/*global document, PDFJS, console */

function PDFViewerPlugin() {
    "use strict";

    async function loadScript(path) {
        return new Promise(function(resolve, reject){
            var script    = document.createElement('script');
            script.async  = false;
            script.src    = path;
            script.type   = 'text/javascript';
            script.onload = () => resolve(script);
            document.getElementsByTagName('head')[0].appendChild(script);
        })
    }

    async function init() {
        await loadScript('/ViewerJS/compatibility.js');
        await loadScript('/ViewerJS/pdf.js');
        await loadScript('/ViewerJS/ui_utils.js');
    }

    var self                    = this,
        pages                   = [],
        domPages                = [],
        renderingStates         = [],
        RENDERING               = {
            BLANK:           0,
            RUNNING:         1,
            FINISHED:        2,
            RUNNINGOUTDATED: 3
        },
        container               = null,
        pdfDocument             = null,
        isGuessedSlideshow      = true, // assume true as default, any non-matching page will unset this
        scale                   = 1,
        currentPage             = 1,
        maxPageWidth            = 0,
        maxPageHeight           = 0,
        createdPageCount        = 0,
        url                     = undefined;

    function isScrolledIntoView( elem ) {
        if ( elem.style.display === "none" ) {
            return false;
        }
   
        var docViewTop    = container.scrollTop,
            docViewBottom = docViewTop + container.clientHeight,
            elemTop       = elem.offsetTop,
            elemBottom    = elemTop + elem.clientHeight;

        // Is in view if either the top or the bottom of the page is between the
        // document viewport bounds,
        // or if the top is above the viewport and the bottom is below it.
        return (elemTop >= docViewTop && elemTop < docViewBottom)
            || (elemBottom >= docViewTop && elemBottom < docViewBottom)
            || (elemTop < docViewTop && elemBottom >= docViewBottom);
    }

    function getDomPage( page ) {
        return domPages[page.pageIndex];
    }

    function getRenderingStatus( page ) {
        return renderingStates[page.pageIndex];
    }

    function setRenderingStatus( page, renderStatus ) {
        renderingStates[page.pageIndex] = renderStatus;
    }

    function updatePageDimensions( page, width, height ) {
        var domPage   = getDomPage(page),
            canvas    = domPage.getElementsByTagName('canvas')[0];

        domPage.style.width  = width + "px";
        domPage.style.height = height + "px";

        canvas.width  = width;
        canvas.height = height;

        if ( getRenderingStatus(page) === RENDERING.RUNNING ) {
            // TODO: should be able to cancel that rendering
            setRenderingStatus(page, RENDERING.RUNNINGOUTDATED);
        } else {
            // Once the page dimension is updated, the rendering state is blank.
            setRenderingStatus(page, RENDERING.BLANK);
        }
    }

    function ensurePageRendered( page ) {
        var domPage, canvas;

        if ( getRenderingStatus(page) === RENDERING.BLANK ) {
            setRenderingStatus(page, RENDERING.RUNNING);

            domPage   = getDomPage(page);
            canvas    = domPage.getElementsByTagName('canvas')[0];

            page.render({
                canvasContext: canvas.getContext('2d'),
                viewport:      page.getViewport(scale)
            }).promise.then(function () {
                if ( getRenderingStatus(page) === RENDERING.RUNNINGOUTDATED ) {
                    // restart
                    setRenderingStatus(page, RENDERING.BLANK);
                    ensurePageRendered(page);
                } else {
                    setRenderingStatus(page, RENDERING.FINISHED);
                }
            });
        }
    }

    function completeLoading() {
        // domPages.forEach((domPage) => {
        //     container.appendChild(domPage);
        // });
        // domPages[0].style.display = "block";
        self.showPage(1);
        self.onLoad();
    }

    async function convertPage(page){
        let canvas = document.createElement('canvas');
        let pageNumber = page.pageIndex + 1;
        canvas.id = 'canvas' + pageNumber;  
        let viewport = page.getViewport(scale);
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
            canvasContext: canvas.getContext('2d'),
            viewport:      page.getViewport(1)
        });

        let thumbnail = document.createElement("canvas");
        let thumbnailContext = thumbnail.getContext('2d');
        thumbnail.width = '200';
        thumbnail.height = '200';
        thumbnailContext.drawImage(canvas, 0,0,200,200);
        return [canvas.toDataURL('image/png'), canvas.toDataURL('image/png', 0.1)];
    }

    function createPage( page ) {
        var pageNumber,
            canvas,
            domPage,
            viewport;

        pageNumber = page.pageIndex + 1;

        viewport = page.getViewport(scale);

        domPage               = document.createElement('div');
        domPage.id            = 'pageContainer' + pageNumber;
        domPage.className     = 'page';
        domPage.style.display = "none";

        canvas    = document.createElement('canvas');
        canvas.id = 'canvas' + pageNumber;

        domPage.appendChild(canvas);

        pages[page.pageIndex]           = page;
        domPages[page.pageIndex]        = domPage;
        renderingStates[page.pageIndex] = RENDERING.BLANK;

        updatePageDimensions(page, viewport.width, viewport.height);
        if ( maxPageWidth < viewport.width ) {
            maxPageWidth = viewport.width;
        }
        if ( maxPageHeight < viewport.height ) {
            maxPageHeight = viewport.height;
        }
        if ( viewport.width < viewport.height ) {
            isGuessedSlideshow = false;
        }

        var thumbnail = canvas.cloneNode(true);  
        thumbnail.style.width = "100%"
        page.render({
            canvasContext: thumbnail.getContext('2d'),
            viewport:      page.getViewport(1)
        }).promise.then(function () {
            if ( getRenderingStatus(page) === RENDERING.RUNNINGOUTDATED ) {
                ensurePageRendered(page);
            }
        });
        window.parent.parent.pageNavigator.push(thumbnail, function(){
            var idx = (this.getAttribute("idx") * 1) + 1;
            self.showPage(idx)
        })

        createdPageCount += 1;
        if ( createdPageCount === (pdfDocument.numPages) ) {
            completeLoading();
        }

    }

    this.createThumbanil = function (thumbnails){
        let url = this.url;
        thumbnails.forEach((e) => {
            let image = new Image();
            image.style.width = '100%';
            image.style.height = '100%';
            image.src = url + e ;
            window.parent.parent.pageNavigator.push(image, function(){
                var idx = (this.getAttribute("idx") * 1) + 1;
                self.showPage(idx)
            })
        })
    }

    this.createCanvas = function (container){
        let image = document.createElement('img');
        this.image = image; 
        container.appendChild(image);
    }

    this.initialize = async function ( viewContainer, location ) {
        window.parent.parent.pageNavigator.removethumbnail();
        let ret = await axios.get(location);
        
        if(ret.status == 200){
            console.log(ret.data);
            this.images = ret.data.images;
            this.url = location.slice(0,location.lastIndexOf('/') + 1) + ret.data.folderName +'/';
            this.createThumbanil(ret.data.thumbnails);
            this.createCanvas(viewContainer);
            window.parent.parent.pageNavigator.set(ret.data.thumbnails.length);
            window.parent.parent.pageNavigator.pdfsetting();
            completeLoading();
        }
    };

    this.convertpages = async function (pdf_url) {
        let pages = [];
        let thumbnails = [];


        await init();
        let doc = await PDFJS.getDocument({ url: pdf_url });
        for (let i = 0; i < doc.numPages; i += 1 ) {
            let page = await doc.getPage(i + 1);
            let data = await convertPage(page);
            pages.push(data[0]);
            thumbnails.push(data[1]);
        }
        return [pages,thumbnails];
    }

    this.isSlideshow = function () {
        return isGuessedSlideshow;
    };

    this.onLoad = function () {
    };

    this.getPages = function () {
        return domPages;
    };

    this.fitToWidth = function ( width ) {
        var zoomLevel;

        if ( maxPageWidth === width ) {
            return;
        }
        zoomLevel = width / maxPageWidth;
        self.setZoomLevel(zoomLevel);
    };

    this.fitToHeight = function ( height ) {
        var zoomLevel;

        if ( maxPageHeight === height ) {
            return;
        }
        zoomLevel = height / maxPageHeight;
        self.setZoomLevel(zoomLevel);
    };

    this.fitToPage = function ( width, height ) {
        var zoomLevel = width / maxPageWidth;
        if ( height / maxPageHeight < zoomLevel ) {
            zoomLevel = height / maxPageHeight;
        }
        self.setZoomLevel(zoomLevel);
    };

    this.fitSmart = function ( width, height ) {
        var zoomLevel = width / maxPageWidth;
        if ( height && (height / maxPageHeight) < zoomLevel ) {
            zoomLevel = height / maxPageHeight;
        }
        zoomLevel = Math.min(1.0, zoomLevel);
        self.setZoomLevel(zoomLevel);
    };

    this.setZoomLevel = function ( zoomLevel ) {
        var i, viewport;
        
        if ( scale !== zoomLevel ) {
            scale = zoomLevel;

            for ( i = 0; i < pages.length; i += 1 ) {
                viewport = pages[i].getViewport(scale);
                updatePageDimensions(pages[i], viewport.width, viewport.height);
            }
        }
    };

    this.getZoomLevel = function () {
        return scale;
    };

    this.onScroll = function () {
        var i;

        for ( i = 0; i < domPages.length; i += 1 ) {
            if ( isScrolledIntoView(domPages[i]) ) {
                ensurePageRendered(pages[i]);
            }
        }
    };

    this.getPageInView = function () {
        var i;

        if ( self.isSlideshow() ) {
            return currentPage;
        } else {
            for ( i = 0; i < domPages.length; i += 1 ) {
                if ( isScrolledIntoView(domPages[i]) ) {
                    return i + 1;
                }
            }
        }
    };

    this.showPage = function ( n ) {
        if(currentPage == n)
            return;
        n = n < 1 ? 1 : n ;

        this.image.src = this.url + this.images[n-1];
        window.parent.parent.showPage(n);     
        currentPage                             = n;
    };

    this.getPluginName = function () {
        return "PDF.js"
    };

    this.getPluginVersion = function () {
        var version = (String(typeof pdfjs_version) !== "undefined"
                ? pdfjs_version
                : "From Source"
        );
        return version;
    };

    this.getPluginURL = function () {
        return "https://github.com/mozilla/pdf.js/";
    };
}
