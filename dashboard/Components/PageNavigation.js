function ThumbnailList() {
    return <span className="scroll2" id="thumbnail-list" />
}

class NaviController extends React.Component {
    render() {
        return <span id="navi-control">
            <img id="lprev" onClick={this.lprev} />
            <img id="prev"  onClick={this.prev} />
            <img id="next"  onClick={this.next} />
            <img id="lnext" onClick={this.lnext} />
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

class PageNavigation extends React.Component {
    state = {
        closed: true,
        currentIdx: 0
    }

    constructor(props) {
        super(props);
        this.collapse = this.collapse.bind(this);
    }

    render() {
        return (
            <>
                <div id="epub-navi" style={{ display: 'none' }} className="shadow-5">
                    <span id="navi-top">
                        <input id="epubidx" autoComplete="off" onChange={this.inputHandler} />
                        <span id="epubmaxidx" />
                        <img className="epub-collapse" onClick={this.collapse} />
                    </span>

                    <ThumbnailList />
                    <NaviController />
                </div>
            </>
        )
    }

    collapse(e) {
        let target = e.target;
        this.setState({ closed: !this.state.closed },() => {
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

    inputHandler() {
        pageNavigator.inputevent()
    };

}