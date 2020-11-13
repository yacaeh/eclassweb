class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isMobile: false,
            showMainVideo: false,
        }
        this.mobileDeviceCheck = this.mobileDeviceCheck.bind(this);
    };

    render() {
        return (
            <>
                <Header />
                <Widget />
                <URLLoader />
                <RightForm />
                <FileViewer />
            </>
        )
    };

    componentDidMount() {
        this.setParamsFromURL();
        ChattingManager.init();
        this.mobileDeviceCheck();
    };

    mobileDeviceCheck() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            this.setState({ isMobile: true });
        }
    };

    setParamsFromURL = () => {
        let params = {},
            r = /([^&=]+)=?([^&]*)/g;
        function d(s) {
            return decodeURIComponent(s.replace(/\+/g, ' '));
        }
        let match,
            search = window.location.search;
        while ((match = r.exec(search.substring(1))))
            params[d(match[1])] = d(match[2]);
        this.setState({roomOwner : params.open == "true"})
    }
}