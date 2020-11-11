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

                        MakeTitlePop("onoff-icon", $.i18n('CANVAS_ON_OFF'));
                        MakeTitlePop("pencilIcon", $.i18n('PENCIL'));
                        MakeTitlePop("markerIcon", $.i18n('MARKER'));
                        MakeTitlePop("eraserIcon", $.i18n('ERASER'));
                        MakeTitlePop("textIcon", $.i18n('TEXT'));
                        MakeTitlePop("undo", $.i18n('UNDO'));
                        MakeTitlePop("clearCanvas", $.i18n('CLEAR_CANVAS'));
                        MakeTitlePop("screen_share", $.i18n('SHARE_SCREEN'));
                        MakeTitlePop("3d_view", $.i18n('SHARE_3D'));
                        MakeTitlePop("movie", $.i18n('SHARE_YOUTUBE'));
                        MakeTitlePop("file", $.i18n('SHARE_FILE'));
                        MakeTitlePop("epub", $.i18n('SHARE_EPUB'));
                        MakeTitlePop("callteacher", $.i18n('CALL_TEACHER'));
                        MakeTitlePop("homework", $.i18n('HOMWORK_ICON'));

                        $('#textInputContainer .textInputUI').attr("placeholder", $.i18n('TEXT_AND_ENTER'));

                        function MakeTitlePop(element, contents) {
                            let pop = document.getElementById("toolboxHelper");
                            element = document.getElementById(element);
                            if (!element)    return;
                            element.addEventListener("mouseover", function () {
                                if (this.classList.contains("off"))
                                    return false;
                                pop.style.display = 'block';
                                let rect = element.getBoundingClientRect();
                                let y = rect.y;
                                pop.style.top = y - 40 + 'px';
                                pop.children[0].innerHTML = contents;
                            })

                            element.addEventListener("mouseleave", function () {
                                pop.style.display = 'none';
                            })
                        }
                    }
                    catch {
                    }
                    $('html').i18n();
                });
        });
    }
}
