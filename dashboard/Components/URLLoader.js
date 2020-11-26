class URLViewer extends React.Component {
    render() {
        return <div id="edunetContent" />
    }
}
class URLLoader extends React.Component {
    state = {
        url: undefined
    }

    constructor(props) {
        super(props);
    };

    render() {
        return (<>
            <div id="urlform" style={{ display: 'none' }}>
                <span className="name">{GetLang('FOOTAGE')}</span>
                <span className="back">
                <input id="urlinput"
                    placeholder={GetLang('ENTER_URL')}
                    onChange={this.handleChange}
                    onKeyUp={this.keyHandler}
                    type="text" />
                </span>
            </div>
        </>)
    };

    handleChange = (e) => {
        this.setState({ url: e.target.value })
    };

    keyHandler = (e) => {
        if (window.event.keyCode == 13) {
            this.moveRenderFuction(this.state.url);
            e.target.value = '';
        }
    };

    moveRenderFuction(url) {
        const movie_type = getMovieType(url);

        if (movie_type == "YOUTUBE") {
            embedYoutubeContent(true, setURLString(url), true);
        }
        else if (movie_type == "ESTUDY" || movie_type == "MOVIE" || url.indexOf("mp4") !== -1) {
            VideoEdunetContent(true, setURLString(url), true);
        }
        else if (movie_type == "GOOGLE_DOC_PRESENTATION") {
            iframeGoogleDoc_Presentation(true, setURLString(url), true);
        }
        else {
            iframeEdunetContent(true, url, true);
        }
    }
}

function _Send_Moive_Video(_type, _url, _visible, _send) {
    classroomInfo.movierender = {
        state: _visible,
        type: _type,
        url: _url,
    };

    classroomManager.updateClassroomInfo(function () { })

    if (_send == true) {
        connection.send({
            MoiveURL: {
                enable: _visible,
                type: _type,
                url: _url
            }
        });
    }
}

function OnMovieRender(state, type, url) {
    switch(type) {
        case "YOUTUBE" : 
            embedYoutubeContent(state, url, false);
            break;
        case "VIDEO" :
            VideoEdunetContent(state, url, false);
            break;
        case "GOOGLE_DOC_PRESENTATION" :
            iframeGoogleDoc_Presentation(state, url, false);
            break;
        default :
            iframeEdunetContent(state, url, false);
            break;
    }
}


function embedYoutubeContent(bshow, url, send) {
    if (bshow) {
        var viwerEdunet = document.getElementById("edunetContent");
        eraseEdunetContent(document.getElementById("webview_edunet"));

        canvasManager.clearCanvas();

        //console.log("div create");
        var div = document.createElement("div");
        div.setAttribute("id", "webview_edunet");
        div.style.width = "100%";
        div.style.height = "100%";
        viwerEdunet.appendChild(div);

        //console.log("object create");
        var obj = document.createElement("object");
        obj.width = "100%";
        obj.height = "100%";
        div.appendChild(obj);

        //console.log("param create");
        var param = document.createElement("param");
        param.name = "movie";
        param.value = "https://www.youtube.com/v/" + url + "?version=3";
        obj.appendChild(param);

        //console.log("param1 create");
        var param1 = document.createElement("param");
        param1.name = "allowFullScreen";
        param1.value = "true";
        obj.appendChild(param1);

        //console.log("param2 create");
        var param2 = document.createElement("param");
        param2.name = "allowscriptaccess";
        param2.value = "always";
        obj.appendChild(param2);

        //<embed src="https://www.youtube.com/v/ugx2S5jdmXs?version=3" type="application/x-shockwave-flash" width="640" height="360" allowscriptaccess="always" allowfullscreen="true"></embed>

        //console.log("embed create");
        var embed = document.createElement("embed");
        embed.src = "https://www.youtube.com/v/" + url + "?version=3";
        embed.type = "application/x-shockwave-flash";
        embed.width = "100%";
        embed.height = "100%";
        embed.allowscriptaccess = "always";
        embed.allowfullscreen = "true";
        obj.appendChild(embed);

        viwerEdunet.style.display = "inline-block";

    }
    else {
        let viwerEdunet = document.getElementById("webview_edunet");
        eraseEdunetContent(viwerEdunet);
    }

    _Send_Moive_Video("YOUTUBE", url, bshow, send);
}

function VideoEdunetContent(bshow, url, send) {
    if (bshow) {
        var viwerEdunet = document.getElementById("edunetContent");
        eraseEdunetContent(document.getElementById("webview_edunet"));

        var videoContent = document.createElement("video");
        var ifrmEdunetContent = document.createElement("source");
        ifrmEdunetContent.setAttribute("src", url);
        videoContent.setAttribute("id", "webview_edunet");
        videoContent.style.width = "100%";
        videoContent.style.height = "100%";
        videoContent.frameBorder = "0";
        videoContent.autoplay = "autoplay";
        videoContent.controls = "true";
        videoContent.appendChild(ifrmEdunetContent);
        viwerEdunet.appendChild(videoContent);
        videoContent.addEventListener('progress', function (e) {
            if (this.buffered.length > 0) {
                var percentage = Math.floor((100 / videoContent.duration) * videoContent.currentTime);
                //console.log(percentage);
            }
        }, false);
        viwerEdunet.style.display = "inline-block";
    } else {
        var webview_cam = document.getElementById("webview_edunet");
        if (webview_cam !== null) {
            var viwer = document.getElementById("edunetContent");
            viwer.removeChild(webview_cam);
            viwer.style.display = "none";
        }
    }
    _Send_Moive_Video("VIDEO", url, bshow, send);
}

function iframeEdunetContent(bshow, url, send) {
    if (bshow) {
        let viwerEdunet = document.getElementById("edunetContent");
        eraseEdunetContent(document.getElementById("webview_edunet"));

        let ifrmEdunetContent = document.createElement("iframe");
        ifrmEdunetContent.setAttribute("src", url);
        ifrmEdunetContent.setAttribute("id", "webview_edunet");
        ifrmEdunetContent.style.width = "100%";
        ifrmEdunetContent.style.height = "100%";
        ifrmEdunetContent.frameBorder = "0";

        viwerEdunet.appendChild(ifrmEdunetContent);
        viwerEdunet.style.display = "inline-block";
    } else {
        let webview_cam = document.getElementById("webview_edunet");
        if (webview_cam !== null) {
            var viwer = document.getElementById("edunetContent");
            viwer.removeChild(webview_cam);
            viwer.style.display = "none";
        }
    }
    _Send_Moive_Video("IFRAME", url, bshow, send);
}

// iframe 접근이 안된다.
// var oldGoogleDocPresentationPage = "";
// var timerGoogleDocPresentationId = null;
// function StartWatchGooglePresentation() {
//     console.log("Start timer")

//     timerGoogleDocPresentationId = setInterval(()=>{
//         let webview_edunet_url = document.getElementById("webview_edunet").contentWindow.location.href;

//         console.log(webview_edunet_url)

//         if( oldGoogleDocPresentationPage !== webview_edunet_url ){
//             oldGoogleDocPresentationPage = webview_edunet_url;

//             _Send_Moive_Video("GOOGLE_DOC_PRESENTATION", oldGoogleDocPresentationPage, true, true);
//         }
//     }, 1000);
// }

//var google_doc_presentation = false;
function iframeGoogleDoc_Presentation(bshow, url, send) {
    if (bshow) {
        // if( google_doc_presentation ){            
        //     let webview_edunet = document.getElementById("webview_edunet");
        //     webview_edunet.setAttribute("src", url);
        // }else{
        let viwerEdunet = document.getElementById("edunetContent");
        eraseEdunetContent(document.getElementById("webview_edunet"));

        console.log(url);

        let ifrmEdunetContent = document.createElement("iframe");
        ifrmEdunetContent.setAttribute("src", url);
        ifrmEdunetContent.setAttribute("id", "webview_edunet");
        ifrmEdunetContent.style.width = "100%";
        ifrmEdunetContent.style.height = "100%";
        ifrmEdunetContent.frameBorder = "0";

        viwerEdunet.appendChild(ifrmEdunetContent);
        viwerEdunet.style.display = "inline-block";

        // if( send ) //선생이다.
        //     StartWatchGooglePresentation();
        // }

        // google_doc_presentation = true;
    } else {
        let webview_edunet = document.getElementById("webview_edunet");
        if (webview_edunet !== null) {
            let viwer = document.getElementById("edunetContent");
            viwer.removeChild(webview_edunet);
            viwer.style.display = "none";
        }

        // if( send )
        //     clearInterval(timerGoogleDocPresentationId);
        //google_doc_presentation = false;
    }

    _Send_Moive_Video("GOOGLE_DOC_PRESENTATION", url, bshow, send);
}

function eraseEdunetContent(viwerEdunet) {
    if (viwerEdunet !== null) {
        let viwer = document.getElementById("edunetContent");
        viwer.removeChild(viwerEdunet);
        viwer.style.display = "none";

        //google_doc_presentation = false;
    }
}

function setURLString(_url) {
    var movieURL = _url;
    var url = _url;

    const movie_type = getMovieType(url);

    if (movie_type == "YOUTUBE") {
        //"<iframe width="560" height="315" src="https://www.youtube.com/embed/3o-A37oDxKw" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>"
        var embed_str = "embed/";

        //유튜브 일경우
        let startIndex = url.indexOf(embed_str);
        if (startIndex != -1) {
            let endIndex = url.indexOf("?");
            if (endIndex == -1) {
                endIndex = url.indexOf("frameborder=") - 2;
            }

            movieURL = url.substring(startIndex + embed_str.length, endIndex);
        }
        else {
            let check_str = "watch?v=";
            startIndex = url.indexOf(check_str);
            let len = url.length;
            if (startIndex != -1) {
                //movieURL = url.replace(check_str, "");
                movieURL = url.substring(startIndex + check_str.length, len);
            }
        }
    }
    else if (movie_type == "ESTUDY") {
        //e학습터
        if (_url.indexOf(".jpg") != -1) {
            movieURL = url.replace('.jpg', '.mp4');
        } else if (_url.indexOf(".JPG") != -1) {
            movieURL = url.replace('.JPG', '.mp4');
        } else {
            movieURL = url;
        }
    }
    else if (movie_type == "VIDEO") {
        //에듀넷 일 경우
        movieURL = _url;
    } else if (movie_type == "GOOGLE_DOC_PRESENTATION") {
        //구글 DOCS
        //<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vRCZDW7lt-7TEKbZJ_9qho5ocP00d-G3maf7qha9hyCuXo1vB0PHCKv-2EdwOW3Yvx1nSnVBJL2sAHF/embed?start=false&loop=false&delayms=3000" frameborder="0" width="960" height="569" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

        if (_url.indexOf(`<iframe src="`) != -1) {
            movieURL = url.replace(`<iframe src="`, '');
        }

        let strlen = movieURL.indexOf(`"`);
        if (strlen != -1) {
            movieURL = movieURL.substring(0, strlen);
        }
    }

    return movieURL;
}

//에듀넷 : http://content-cdn.edunet.net/edudata/content/midd/g2/com/soc/midd_g2_com_soc_15187.mp4?token=st=1593864169~exp=1593871369~acl=/edudata/content/midd/g2/com/soc/midd_g2_com_soc_15187.mp4~hmac=c20c6534e1fd9e1de2d1b8a15c5f156ea7d18501eb6539417e25966c3a712df7
//e학습터 : https://static-cdn.edunet.net/edudata/content/elem/g6/s01/sci/elem_g6_s01_sci_14905.jpg

function getMovieType(_url) {
    if (_url.indexOf("youtube") != -1) {
        return "YOUTUBE";
    }
    else if (_url.indexOf("static-cdn") != -1) {
        return "ESTUDY";
    }
    else if (_url.indexOf("docs.google.com") != -1) {
        return "GOOGLE_DOC_PRESENTATION"
    }
    else {
        return "VIDEO";
    }
}


