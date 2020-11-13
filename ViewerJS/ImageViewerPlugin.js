function ImageViewerPlugin() {
    "use strict";

    var imgElement  = undefined,
        self        = this;

    this.initialize = function ( viewerElement, documentUrl ) {
        imgElement = document.createElement("img");
        imgElement.src = documentUrl;
        imgElement.setAttribute('alt', 'na');
        imgElement.setAttribute('id', 'image');
        imgElement.style.width = '100%';
        imgElement.style.height = 'auto'
        imgElement.style.maxWidth = '900px';
        viewerElement.appendChild(imgElement);
        viewerElement.style.overflow = "auto";
        self.onLoad();
    };


    this.onLoad = function () {
        console.error("on loadk")

    };

    this.getPages = function () {
        return [1, 2];
    };

    this.getPluginName = function () {
        return "ImageViewerPlugin";
    };

    this.getPluginVersion = function () {
        return "From Source";
    };

    this.getPluginURL = function () {
        return "https://github.com/in4mates/ViewerJS";
    };
}
