class Article extends React.Component {
    render() {
        return <article id="article">
            <WidgetContainer />
            <Authorization />
        </article>
    }
}

function WidgetContainer() {
    return <div id="widget-container">
        <ToolBox />
        <Exam />
        <AlertBox />
        <PageNavigation />
        <URLViewer />
    </div>
}

class ToolBox extends React.Component {
    render(){
        return <section id="tool-box" className="tool-box">
            <canvas className="on" id="onoff-icon" className="on" width="28" height="28" ></canvas>
            <canvas className="draw" id="pencilIcon" width="28" height="28" ></canvas>
            <canvas className="draw" id="markerIcon" width="28" height="28" ></canvas>
            <canvas className="i draw" id="eraserIcon" width="28" height="28" ></canvas>
            <canvas className="i draw" id="textIcon" width="28" height="28"></canvas>
            <canvas className="i draw" id="undo" width="28" height="28"></canvas>
            <canvas className="i draw" id="clearCanvas" width="28" height="28" ></canvas>
            <div className="tooldivide"></div>
            <canvas className="i"  id="screen_share" width="28" height="28" ></canvas>
            <canvas className="i"  id="3d_view" width="28" height="28" ></canvas>
            <canvas className="i"  id="movie" width="28" height="28"></canvas>
            <canvas className="i"  id="file" width="28" height="28"></canvas>
            <canvas className="i"  id="epub" width="28" height="28"></canvas>
            <canvas className="i"  id="callteacher" width="28" height="28"></canvas>
            <canvas className="i"  id="homework" width="28" height="28"></canvas>
            <canvas className="i no-hover"  id="full" width="28" height="28"></canvas>
        </section>
    }
}