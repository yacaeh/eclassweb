
class Canvas extends React.Component {
    render() {
        let url = './widget.html';
        return <div id='canvas-div' >
            <MarkerContainer />
            <PencilContainer />
            <TextInputContainer />
            <iframe className='canvas-iframe' id='widget-canvas' src={url} />
        </div>
    }
}


class MarkerContainer extends React.Component {
    render() {
        return <section id="marker-container" className="context-popup colors-container">
            <input style={{ display: 'none' }} id="sliderval" type="number" className="sliderval inputbox" />
            <div className="color_template" />
            <Slider id="markerslider" />
            <input className="svalue" id="marker-stroke-style" />
        </section>
    }
}

class PencilContainer extends React.Component {
    render() {
        return <section id="pencil-container" className="context-popup colors-container">
            <input style={{ display: 'none' }} id="sliderval" type="number" className="sliderval inputbox" />
            <div className="color_template" />
            <Slider id="pencileslider" />
            <input className="svalue" id="pencil-stroke-style" />
        </section>
    }
}

function Slider(props) {
    return <span id={props.id} className="slider-front">
        <span className="slider-back" />
        <span className="slider_btn" />
    </span>
}

class TextInputContainer extends React.Component {
    fontSize = [15, 17, 19, 20, 22, 25, 30, 35, 42, 48, 60, 72, 80, 90, 150];
    fontFamily = ['HY중고딕', '나눔고딕', '나눔펜글씨', 'Times New Roman', 'Verdana']
    render() {
        return (<> <div id="textInputContainer">
            <input className="textInputUI" type="text" />

            <ul className="fontSelectUl">
                <li>HY중고딕</li>
                <li>나눔고딕</li>
                <li>나눔펜글씨</li>
                <li>Times New Roman</li>
                <li>Verdana</li>
            </ul>

            <ul className="fontSizeUl">
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

    fontFamilySetting = () => {
        function Li(props) {
            return <li> {props.font} </li>
        }
        let list = [];
        this.fontFamily.forEach(font => {
            list.push(<Li font={font} key={font} />);
        });
        return list;
    }

    FontSizeSetting = () => {
        function Li(props) {
            return <li> {props.size} </li>
        }
        let list = [];
        this.fontSize.forEach(size => {
            list.push(<Li size={size} key={size} />);
        });
        return list;
    }
}
