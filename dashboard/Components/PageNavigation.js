class PageNavigation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            enable: false,
            closed: true,
            currentIdx: 0,
            thumbnails: [],
        }
        this.collapse = this.collapse.bind(this);
    }

    componentDidMount() {
        reactEvent.navigation.push = (src, clickevent) => {
            this.setState(
                ({ thumbnails }) => ({
                    thumbnails: thumbnails.concat({ src, clickevent })
                })
            )
        }

        reactEvent.navigation.removeThumbnails = () => {
            this.setState({
                thumbnails: []
            })
        }
    }

    render() {
        return (
            <>
                <div id="epub-navi" style={{ display: 'none' }} className="shadow-5">
                    <span id="navi-top">
                        <input id="epubidx" autoComplete="off" onKeyDown={this.keyHandler} onBlur={this.blurHandler} />
                        <span id="epubmaxidx" />
                        <img className="epub-collapse" onClick={this.collapse} />
                    </span>

                    <ThumbnailList list={this.state.thumbnails} />
                    <NaviController />
                </div>
            </>
        )
    }

    collapse(e) {
        let target = e.target;
        this.setState({ closed: !this.state.closed }, () => {
            if (!this.state.closed) {
                $(pageNavigator.obj).animate({ "height": "95%" });
                target.style.transform = "rotate(-90deg)";
            }
            else {
                $(pageNavigator.obj).animate({ "height": "93px" });
                target.style.transform = "rotate(90deg)";
            }
        });

    };

    keyHandler = (e) => {
        if (e.keyCode == 13) {
            this.eventHandler();
        }
    }

    blurHandler = () => {
        this.eventHandler();
    }

    eventHandler() {
        pageNavigator.inputevent()
    };
}


class NaviController extends React.Component {
    render() {
        return <span id="navi-control">
            {(!store.getState().classroomInfo.allControl || store.getState().isOwner) && <>
                <img id="lprev" onClick={this.lprev} />
                <img id="prev" onClick={this.prev} />
                <img id="next" onClick={this.next} />
                <img id="lnext" onClick={this.lnext} />
            </>
            }
        </span>
    };

    lprev() {
        pageNavigator.lastleftbtn();
    };

    prev() {
        pageNavigator.leftbtn();
    };

    next() {
        pageNavigator.rightbtn();
    };

    lnext() {
        pageNavigator.lastrightbtn();
    }
}

class ThumbnailList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const list = this.props.list.map((x, idx) => {
            return <Thumbnail key={x.src} idx ={idx} src={x.src} event={x.clickevent} />
        });
        return <span className="scroll2" id="thumbnail-list">
            {list}
        </span>
    }
}

function Thumbnail(props) {
    let style = {
        pointerEvents: (store.getState().classroomInfo.allControl && !store.getState().isOwner) ? "none" : 'unset'
    }

    return <div style={style} onClick={props.event} className="thumbnail" idx={props.idx}>
        <img style={{ width: '100%', height: '100%', pointerEvents: "none" }} src={props.src} />
    </div>
}
