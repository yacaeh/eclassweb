class PageNavigation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            enable: false,
            closed: true,
            currentIdx: 0,
            thumbnails: [],
        }

        this.navi = React.createRef();
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
                <div ref={this.navi} id="page-navigation" 
                style={{ display: 'none' }} 
                className="shadow-5">
                    <span className="navi-top">
                        <input 
                            id="page-navigation-idx" 
                            autoComplete="off" 
                            onKeyDown={this.keyHandler} 
                            onBlur={this.blurHandler} />
                        <span id="page-navigation-maxidx" />
                        <img 
                        className="page-navigation-collapse" 
                        onClick={this.collapse} />
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
                this.navi.current.className = "shadow-5 on"
                target.style.transform = "rotate(-90deg)";
            }
            else {
                this.navi.current.className = "shadow-5 off"
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
                <img id="lprev" onClick={reactEvent.navigation.lpre} />
                <img id="prev"  onClick={reactEvent.navigation.pre} />
                <img id="next"  onClick={reactEvent.navigation.next} />
                <img id="lnext" onClick={reactEvent.navigation.lnext} />
            </>
            }
        </span>
    };

    componentDidMount(){
        reactEvent.navigation.lpre = () => {
            pageNavigator.lastleftbtn();
        }
        reactEvent.navigation.pre = () => {
            pageNavigator.leftbtn();
        }
        reactEvent.navigation.next = () => {
            pageNavigator.rightbtn();
        }
        reactEvent.navigation.lnext = () => {
            pageNavigator.lastrightbtn();
        }
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
