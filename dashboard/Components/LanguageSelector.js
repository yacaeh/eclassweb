class LanguageSelector extends React.Component {
    constructor(props) {
        super(props);

        if (!localStorage.getItem("locale")) {
            localStorage.setItem('locale', 'en');
        }

        window.language = localStorage.getItem('locale');
        this.updateLanguage();
    }

    render() {
        return <span>
            <select className="language span3" onChange={this.saveLocale}>
                <option value="en">English</option>
                <option value="ko">한국어</option>
                <option value="id">Bahasa Indonesia</option>
            </select>
        </span>
    }

    saveLocale = () => {
        window.language = $('.language option:selected').val();
        localStorage.setItem('locale', window.language);
        this.updateLanguage();
    }

    updateLanguage() {
        jQuery(function ($) {
            let options = document.getElementsByClassName("language")[0].children;
            for (let i = 0; i < options.length; i++) {
                if (options[i].value == localStorage.getItem("locale"))
                    options[i].setAttribute("selected", '');
            }

            window.i18n = $.i18n();
            window.language = localStorage.getItem('locale');
            window.i18n.locale = window.language;
            window.i18n.load('/dashboard/js/languages/' + i18n.locale + '.json', i18n.locale)
                .done(function () {
                    $("title").prop({
                        text: $.i18n('TITLE')
                    });

                    $('#txt-roomid').prop({
                        placeholder: $.i18n('ROOM_NUMBER')
                    });

                    $('#txt-user-name').prop({
                        placeholder: $.i18n('NAME')
                    });

                    $('#txt-room-password').prop({
                        placeholder: $.i18n('PASSWORD')
                    });

                    $('.conversation-panel .emojionearea-editor').prop({
                        placeholder: $.i18n('CHAT_PLACEHOLDER'),
                    });

                    $('#exam-time').prop({
                        placeholder: $.i18n('QUIZ_MINUTES')
                    });

                    $('#urlform #urlinput').prop({
                        placeholder: $.i18n('ENTER_URL')
                    });

                    $('.emojionearea-editor').attr("placeholder", $.i18n('CHAT_PLACEHOLDER'));

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

                        GetWidgetFrame().updateLanguage();
                        GetWidgetFrame().$('#textInputContainer .textInputUI').attr("placeholder", $.i18n('TEXT_AND_ENTER'));
                    }
                    catch {
                    }
                    $('html').i18n();
                });
        });
    }
}
