class LanguageSelector extends React.Component {
    constructor(props) {
        super(props);
        if (!localStorage.getItem("locale")) {
            localStorage.setItem('locale', 'en');
        }
        window.language = localStorage.getItem('locale');
        this.state = {
            lang: window.language
        }
        this.updateLanguage();
    }

    render() {
        return <select className="language span3" value={this.state.lang} onChange={this.saveLocale}>
            <option value="en">English</option>
            <option value="ko">한국어</option>
            <option value="id">Bahasa Indonesia</option>
        </select>
    }

    saveLocale = (e) => {
        window.language = e.target.value;
        localStorage.setItem('locale', window.language);
        this.setState({ lang: window.language })
        this.updateLanguage();
    }

    updateLanguage() {
        function get(id) {
            return document.getElementById(id);
        };

        function setInnerHTML(id, content) {
            let element = get(id);
            if (!element)
                return;
            element.innerHTML = content;
        }

        function setPlaceHolder(id, content) {
            let element = get(id);
            if (!element)
                return;
            element.setAttribute('placeholder', content);
        }

        window.language = localStorage.getItem('locale');
        axios.get('/dashboard/js/languages/' + window.language + '.json').then((e) => {
            let action = {type : CHANGE_LANGUAGE, data : e.data};
            store.dispatch(action);
            window.langlist = e.data;
            document.title = window.langlist.TITLE;

            // Index.html ==
            setInnerHTML('device-cam', window.langlist.CAMERA);
            setInnerHTML('device-mic', window.langlist.MIC);
            setInnerHTML('device-network', window.langlist.NETWORK);
            setInnerHTML('refresh', window.langlist.REFRESH);
            setInnerHTML('btn-create-room', window.langlist.TEACHER);
            setInnerHTML('btn-join-hidden-room', window.langlist.STUDENT);
            setInnerHTML('login-title', window.langlist.LOGIN);
            setInnerHTML('login-roomnum', window.langlist.ROOM_NUMBER);
            setInnerHTML('login-name', window.langlist.NAME);
            setInnerHTML('login-pw', window.langlist.PASSWORD);
            setPlaceHolder('txt-roomid', window.langlist.ROOM_NUMBER);
            setPlaceHolder('txt-user-name', window.langlist.NAME);
            setPlaceHolder('txt-room-password', window.langlist.PASSWORD);
        });

    }
}
