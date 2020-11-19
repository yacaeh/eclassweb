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
        this.CheckLogin();
        ChattingManager.init();
        this.mobileDeviceCheck();
    };

    CheckLogin() {
        if (!window.params.userFullName) {
      
          let request = new XMLHttpRequest();
          request.open('POST', '/get-now-account', false);
          request.send(JSON.stringify({ id: params.sessionid }));
      
          if (request.status === 200) {
            const ret = JSON.parse(request.responseText);
            console.log(ret)
            if (ret.code == 400) {
              console.error("no login info")
              alert("로그인 정보가 없습니다");
              location.href = '/dashboard/login.html';
            }
            else {
              connection.userid = ret.data.uid;
              connection.byLogin = true;
              connection.extra.userFullName = ret.data.name;
            }
          }
        }
      }

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