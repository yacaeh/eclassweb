var top_movie_jthis;
var move_url_div =  $("#urlform");

function _Movie_Render_Button_Func()
{
    top_movie_jthis = $("#top_share_video");    

    if(params.open == "true")
    {
        top_movie_jthis.click(function(){
            //_3dcanvas.toggle();
            Movie_Render_Button();
        })
    }
}

function Movie_Render_Button(btn){
    if(!isSharingMovie && checkSharing()){
      removeOnSelect(btn);
      return;
    }
  
    var visible = urlform.style.display;
        
    console.log(visible);
    
    if(visible == "inline-block")
    {
        isSharingMovie = false;
        urlform.style.display = "none";
        embedYoutubeContent(false,"", true);
    }
    else{
        isSharingMovie = true;
        urlform.style.display = "inline-block";
    }
}

function _Send_Moive_Video(_type, _url, _visible , _send)
{
    // _Movie_Button_Enable(top_movie_jthis,_visible);

    if (_send == true) {
        connection.send({
            MoiveURL: { enable: _visible , type : _type, url:_url }
        });
    }
}

function _Movie_Button_Enable(jthis,visible)
{
    if(visible)
    {
        jthis.addClass('top_share_video_on');
        jthis.removeClass('top_share_video_off')
    }
    else
    {
        jthis.addClass('top_share_video_off');
        jthis.removeClass('top_share_video_on')
    }
}


function _Movie_Render_key_event() {
    if (window.event.keyCode == 13) {

         // 엔터키가 눌렸을 때 실행할 내용
         _Movie_Render_Func();
    }
}


function _Movie_Render_Func() {
    var urlinput = document.getElementById("urlinput");
    var url = urlinput.value;
    

    console.log(movie_url);

    if(getMovieType(url) == "YOUTUBE")
    {
        var movie_url = setURLString(url);
        embedYoutubeContent(true, movie_url, true);
    }
    else if( getMovieType(url) == "ESTUDY" || getMovieType(url) == "MOVIE" || url.indexOf("mp4") !== -1 ){
        VideoEdunetContent(true, setURLString(url), true);
    }else{
        iframeEdunetContent(true,url,true);
    }
}

function embedYoutubeContent(bshow, url, send)
{
    var webview_edunet = document.getElementById("webview_edunet");
    if(webview_edunet && bshow == true)
        return;

    if( bshow ){
        var viwerEdunet = document.getElementById("edunetContent");
        console.log("div create");
        var div = document.createElement("div");
        div.setAttribute("id", "webview_edunet");
        div.style.width = "100%";
        div.style.height = "100%";
        viwerEdunet.appendChild(div);

        console.log("object create");
        var obj = document.createElement("object");
        obj.width = "100%";
        obj.height = "100%";
        div.appendChild(obj);

        console.log("param create");
        var param = document.createElement("param");
        param.name = "movie";
        param.value = "https://www.youtube.com/v/"+ url +"?version=3";
        obj.appendChild(param);

        console.log("param1 create");
        var param1 = document.createElement("param");
        param1.name = "allowFullScreen";
        param1.value = "true";
        obj.appendChild(param1);

        console.log("param2 create");
        var param2 = document.createElement("param");
        param2.name = "allowscriptaccess";
        param2.value = "always";
        obj.appendChild(param2);

        //<embed src="https://www.youtube.com/v/ugx2S5jdmXs?version=3" type="application/x-shockwave-flash" width="640" height="360" allowscriptaccess="always" allowfullscreen="true"></embed>
        
        console.log("embed create");
        var embed = document.createElement("embed");
        embed.src = "https://www.youtube.com/v/" + url + "?version=3";
        embed.type= "application/x-shockwave-flash";
        embed.width = "100%";
        embed.height = "100%";
        embed.allowscriptaccess = "always";
        embed.allowfullscreen = "true";
        obj.appendChild(embed);		
        
        viwerEdunet.style.display = "inline-block";
        
    }
    else{
        var viwerEdunet = document.getElementById("webview_edunet");
        if( viwerEdunet !== null ){
            var viwer = document.getElementById("edunetContent");
            viwer.removeChild(viwerEdunet);

            viwer.style.display = "none";
        }
    } 

    _Send_Moive_Video("YOUTUBE",url, bshow, send);

}
function iframeEdunetContent(bshow, url, send) {
    var webview_edunet = document.getElementById("webview_edunet");
    if(webview_edunet && bshow == true)
        return;
    if( bshow ){
        var viwerEdunet = document.getElementById("edunetContent");
            var ifrmEdunetContent = document.createElement("iframe");
            ifrmEdunetContent.setAttribute("src", url);
            ifrmEdunetContent.setAttribute("id", "webview_edunet");
			ifrmEdunetContent.style.width = "100%";
            ifrmEdunetContent.style.height = "100%";
            ifrmEdunetContent.frameBorder = "0";
			
            viwerEdunet.appendChild(ifrmEdunetContent);
        viwerEdunet.style.display = "inline-block";
    }else{
        var webview_cam = document.getElementById("webview_edunet");
        if( webview_cam !== null ){
            var viwer = document.getElementById("edunetContent");
            viwer.removeChild(webview_cam);
            viwer.style.display = "none";
        }
    }
    _Send_Moive_Video("IFRAME",url, bshow, send);
}


function VideoEdunetContent(bshow, url, send) {
    var webview_edunet = document.getElementById("webview_edunet");
    if(webview_edunet && bshow == true)
        return;
    var timer = 0;
    if( bshow ){
        var viwerEdunet = document.getElementById("edunetContent");
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
                console.log(percentage);
            } 
        }, false); 
        viwerEdunet.style.display = "inline-block";
    }else{
        var webview_cam = document.getElementById("webview_edunet");
        if( webview_cam !== null ){
            var viwer = document.getElementById("edunetContent");
            viwer.removeChild(webview_cam);
            viwer.style.display = "none";
        }
    }
    _Send_Moive_Video("VIDEO",url, bshow, send);
}


function setURLString(_url)
{
    var movieURL = _url;
    var url = _url;

    if(getMovieType(url) == "YOUTUBE")
    {
        //"<iframe width="560" height="315" src="https://www.youtube.com/embed/3o-A37oDxKw" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>"
        var embed_str = "embed/";

        //유튜브 일경우
        var startIndex = url.indexOf(embed_str);
        if (startIndex != -1)
        {
            var endIndex = url.indexOf("?");
            if (endIndex == -1)
            {
                endIndex = url.indexOf("frameborder=") - 2;
            }

            movieURL = url.substring(startIndex + embed_str.length, endIndex);
        }
        else
        {
            var check_str = "watch?v=";
            startIndex = url.indexOf(check_str);
            var len = url.length;
            if (startIndex != -1)
            {
                //movieURL = url.replace(check_str, "");
                movieURL = url.substring(startIndex + check_str.length, len);            
            }
        }
    }
    else if(getMovieType(url) == "ESTUDY")
    {
        //e학습터
        if(_url.indexOf(".jpg") != -1){
            movieURL = url.replace('.jpg', '.mp4');
        }else if(_url.indexOf(".JPG") != -1){
            movieURL = url.replace('.JPG', '.mp4');
        }else{
            movieURL = url;
        }
    }
    else if(getMovieType(url) == "VIDEO")
    {
        //에듀넷 일 경우
        movieURL = _url;
    }

    return movieURL;
}

//에듀넷 : http://content-cdn.edunet.net/edudata/content/midd/g2/com/soc/midd_g2_com_soc_15187.mp4?token=st=1593864169~exp=1593871369~acl=/edudata/content/midd/g2/com/soc/midd_g2_com_soc_15187.mp4~hmac=c20c6534e1fd9e1de2d1b8a15c5f156ea7d18501eb6539417e25966c3a712df7
//e학습터 : https://static-cdn.edunet.net/edudata/content/elem/g6/s01/sci/elem_g6_s01_sci_14905.jpg

function getMovieType(_url)
{
    if(_url.indexOf("youtube") != -1)
    {
        return  "YOUTUBE";
    }
    else if(_url.indexOf("static-cdn") != -1)
    {
        return "ESTUDY";
    }
    else 
    {
        return "VIDEO";
    }
}
