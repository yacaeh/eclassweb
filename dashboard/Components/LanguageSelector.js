class LanguageSelector extends React.Component {
    constructor(props) {
        super(props);
        if (!localStorage.getItem("locale")) {
            localStorage.setItem('locale', 'en');
        }
        window.language = localStorage.getItem('locale');
        this.state = {
            lang : window.language
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
        this.setState({lang : window.language})
        this.updateLanguage();
    }

    updateLanguage() {
        jQuery(async function ($) {
            window.i18n = $.i18n();
            window.language = localStorage.getItem('locale');
            window.i18n.locale = window.language;
            let lang = await axios.get('/dashboard/js/languages/' + i18n.locale + '.json');

            window.langlist = lang.data;


            $('#btn-confirm-action').html($.i18n('OK'));
            $("title").prop({text: $.i18n('TITLE')});
            $('#txt-roomid').prop({placeholder: $.i18n('ROOM_NUMBER')});
            $('#txt-user-name').prop({placeholder: $.i18n('NAME')});
            $('#txt-room-password').prop({placeholder: $.i18n('PASSWORD')});
            $('#exam-time').prop({placeholder: $.i18n('QUIZ_MINUTES')});
            $('#urlform #urlinput').prop({placeholder: $.i18n('ENTER_URL')});
            $('#txt-chat-message').attr("placeholder", $.i18n('CHAT_PLACEHOLDER'));
            $('#btn-confirm-close').html($.i18n('CANCEL'));
            $('#btn-confirm-file-close').html($.i18n('CLOSE_CURRENT_FILE'));
            $('#confirm-title').html($.i18n('FILE_MANAGER'));
            $('#confirm-title2').html($.i18n('ASSIGNMENT'));
            $('#btn-confirm-file-close').html($.i18n('CLOSE_CURRENT_FILE'));
            $('#confirm-title2').html($.i18n('ASSIGNMENT'))
            $('#btn-confirm-close').html($.i18n('CANCEL'));

            try {
                topButtonContents.top_all_controll = $.i18n('MANAGE_ALL');
                topButtonContents.top_test = $.i18n('TOP_QUIZ');
                topButtonContents.top_alert = $.i18n('TOP_NOTIFY');
                topButtonContents.top_student = $.i18n('TOP_STUDNET_CANVAS');
                topButtonContents.top_camera = $.i18n('TOP_CAMERA');
                topButtonContents.top_save_alert = $.i18n('TOP_SAVE_ALERT');
                topButtonContents.top_record_video = $.i18n('TOP_RECORD_VIDEO');
                topButtonContents.student_isallcontrol = $.i18n('STUDENT_ALLCONTROL');
                topButtonContents.student_screenshare = $.i18n('STUDENT_SCREEN_SHARE');
                topButtonContents.student_canvas = $.i18n('STUDENT_CANVAS');
                topButtonContents.student_mic = $.i18n('STUDENT_MIC');

                document.getElementById("onoff-icon").dataset.content   = window.langlist.CANVAS_ON_OFF;
                document.getElementById("pencilIcon").dataset.content   = window.langlist.PENCIL;
                document.getElementById("markerIcon").dataset.content   = window.langlist.MARKER;
                document.getElementById("eraserIcon").dataset.content   = window.langlist.ERASER;
                document.getElementById("textIcon").dataset.content     = window.langlist.TEXT;
                document.getElementById("undo").dataset.content         = window.langlist.UNDO;
                document.getElementById("clearCanvas").dataset.content  = window.langlist.CLEAR_CANVAS;
                document.getElementById("screen_share").dataset.content = window.langlist.SHARE_SCREEN;
                document.getElementById("3d_view").dataset.content      = window.langlist.SHARE_3D;
                document.getElementById("movie").dataset.content        = window.langlist.SHARE_YOUTUBE;
                document.getElementById("file").dataset.content         = window.langlist.SHARE_FILE;
                document.getElementById("epub").dataset.content         = window.langlist.SHARE_EPUB;
                document.getElementById("callteacher").dataset.content  = window.langlist.CALL_TEACHER;
                document.getElementById("homework").dataset.content     = window.langlist.HOMWORK_ICON;

                $('#textInputContainer .textInputUI').attr("placeholder", $.i18n('TEXT_AND_ENTER'));
            }
            catch {
            }
            $('html').i18n();
        });
    }
}
