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
        <MarkerContainer />
        <PencilContainer />
        <TextInputContainer />
    </div>
}

class MarkerContainer extends React.Component {
    render() {
        return <section id="marker-container" className="context-popup colors-container">
            <input style={{ display: 'none' }} id="sliderval" type="number" className="sliderval inputbox" />
            <div className="color_template" />
            <span id="markerslider" className="slider-front">
                <span className="slider-back" />
                <span className="slider_btn" />
            </span>
            <input className="svalue" id="marker-stroke-style" />
            <div id="marker-done" style={{ display: 'none' }} className="btn-007">선택</div>
        </section>
    }
}

class PencilContainer extends React.Component {
    render() {
        return <section id="pencil-container" className="context-popup colors-container">
            <input style={{ display: 'none' }} id="sliderval" type="number" className="sliderval inputbox" />
            <div className="color_template" />
            <span id="pencileslider" className="slider-front">
                <span className="slider-back" />
                <span className="slider_btn" />
            </span>
            <input className="svalue" id="pencil-stroke-style" />
            <div className="done" id="pencil-done" style={{ display: 'none' }} className="btn-007">선택</div>
        </section>
    }
}

class TextInputContainer extends React.Component {
    render() {
        return (<> <div id="textInputContainer" style={{ zIndex: 99999999 }}>
            <input className="textInputUI"
                type="text"
                style={{
                    display: 'none',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '216px',
                    height: '50px',
                    border: '5px solid black',
                    imeMode: 'active'
                }} />

            <ul className="fontSelectUl" style={{
                display: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '166px'
            }} >
                <li>HY중고딕</li>
                <li>나눔고딕</li>
                <li>나눔펜글씨</li>
                <li>Times New Roman</li>
                <li>Verdana</li>
            </ul>

            <ul className="fontSizeUl" style={{
                display: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '50px',
                textAlign: 'center'
            }}>
                <li>15</li>
                <li>17</li>
                <li>19</li>
                <li>20</li>
                <li>22</li>
                <li>25</li>
                <li>30</li>
                <li>35</li>
                <li>42</li>
                <li>48</li>
                <li>60</li>
                <li>72</li>
                <li>80</li>
                <li>90</li>
                <li>150</li>
            </ul>
            <div className="color_template_text" />
        </div>
        </>)
    }
}

class ToolBox extends React.Component {
    render() {
        return <section id="tool-box" className="tool-box">
            <canvas className="on" id="onoff-icon" className="on" width="28" height="28" ></canvas>
            <canvas className="draw" id="pencilIcon" width="28" height="28" ></canvas>
            <canvas className="draw" id="markerIcon" width="28" height="28" ></canvas>
            <canvas className="i draw" id="eraserIcon" width="28" height="28" ></canvas>
            <canvas className="i draw" id="textIcon" width="28" height="28"></canvas>
            <canvas className="i draw" id="undo" width="28" height="28"></canvas>
            <canvas className="i draw" id="clearCanvas" width="28" height="28" ></canvas>
            <div className="tooldivide"></div>
            <canvas className="i" id="screen_share" width="28" height="28" ></canvas>
            <canvas className="i" id="3d_view" width="28" height="28" ></canvas>
            <canvas className="i" id="movie" width="28" height="28"></canvas>
            <canvas className="i" id="file" width="28" height="28"></canvas>
            <canvas className="i" id="epub" width="28" height="28"></canvas>
            <canvas className="i" id="callteacher" width="28" height="28"></canvas>
            <canvas className="i" id="homework" width="28" height="28"></canvas>
            <canvas className="i no-hover" id="full" width="28" height="28"></canvas>
        </section>
    }
}
