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

        function setDataset(id, content) {
            let element = get(id);
            if (!element)
                return;
            element.dataset.content = content;
        }

        window.language = localStorage.getItem('locale');
        axios.get('/dashboard/js/languages/' + window.language + '.json').then((e) => {
            
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


            // Classroom.html ==

            setPlaceHolder('txt-roomid', window.langlist.ROOM_NUMBER);
            setPlaceHolder('txt-user-name', window.langlist.NAME);
            setPlaceHolder('txt-room-password', window.langlist.PASSWORD);
            setPlaceHolder('exam-time', window.langlist.QUIZ_MINUTES);
            setPlaceHolder('urlform', window.langlist.ENTER_URL);
            setPlaceHolder('urlinput', window.langlist.ENTER_URL);
            setPlaceHolder('txt-chat-message', window.langlist.CHAT_PLACEHOLDER);
            
            setInnerHTML('confirm-title', window.langlist.FILE_MANAGER);
            setInnerHTML('confirm-title2', window.langlist.ASSIGNMENT);
            setInnerHTML('btn-confirm-file-close', window.langlist.CLOSE_CURRENT_FILE);
            setInnerHTML('btn-confirm-action', window.langlist.OK);

            setInnerHTML('exam-question-count-label', window.langlist.QUIZ_NUM);
            setInnerHTML('exam-time-label', window.langlist.QUIZ_TIME);
            setInnerHTML('exam-setting-apply', window.langlist.QUIZ_SETTING);
            setInnerHTML('exam-start', window.langlist.QUIZ_START);
            setInnerHTML('exam-title', window.langlist.QUIZ_CREATE);
            
            setInnerHTML('STUDENT_SHARE_SCREEN', window.langlist.STUDENT_SHARE_SCREEN);
            setInnerHTML('STUDENT_SHARE_MIC', window.langlist.STUDENT_SHARE_MIC);
            setInnerHTML('STUDENT_SHARE_CANVAS', window.langlist.STUDENT_SHARE_CANVAS);

            setInnerHTML('urlfootage', window.langlist.FOOTAGE);
            setInnerHTML('chat-notice', window.langlist.TEACHER_CHAT);

            setDataset("onoff-icon", window.langlist.CANVAS_ON_OFF);
            setDataset("pencilIcon", window.langlist.PENCIL);
            setDataset("markerIcon", window.langlist.MARKER);
            setDataset("eraserIcon", window.langlist.ERASER);
            setDataset("textIcon", window.langlist.TEXT);
            setDataset("undo", window.langlist.UNDO);
            setDataset("clearCanvas", window.langlist.CLEAR_CANVAS);
            setDataset("screen_share", window.langlist.SHARE_SCREEN);
            setDataset("3d_view", window.langlist.SHARE_3D);
            setDataset("movie", window.langlist.SHARE_YOUTUBE);
            setDataset("file", window.langlist.SHARE_FILE);
            setDataset("epub", window.langlist.SHARE_EPUB);
            setDataset("callteacher", window.langlist.CALL_TEACHER);
            setDataset("homework", window.langlist.HOMWORK_ICON);
            
            if(typeof topButtonContents != "undefined"){
                topButtonContents.top_all_controll = window.langlist.MANAGE_ALL;
                topButtonContents.top_test = window.langlist.TOP_QUIZ;
                topButtonContents.top_alert = window.langlist.TOP_NOTIFY;
                topButtonContents.top_student = window.langlist.TOP_STUDNET_CANVAS;
                topButtonContents.top_camera = window.langlist.TOP_CAMERA;
                topButtonContents.top_save_alert = window.langlist.TOP_SAVE_ALERT;
                topButtonContents.top_record_video = window.langlist.TOP_RECORD_VIDEO;
                topButtonContents.student_isallcontrol = window.langlist.STUDENT_ALLCONTROL;
                topButtonContents.student_screenshare = window.langlist.STUDENT_SCREEN_SHARE;
                topButtonContents.student_canvas = window.langlist.STUDENT_CANVAS;
                topButtonContents.student_mic = window.langlist.STUDENT_MIC;
            }

        });

    }
}
