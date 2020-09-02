function updateLanguage(){
	jQuery(function($) {
		i18n = $.i18n();
		i18n.locale = window.top.language;
		$.i18n().load( '/dashboard/js/languages/' + i18n.locale + '.json', i18n.locale )
		.done(function() {
			MakeTitlePop("onoff-icon",$.i18n('CANVAS_ON_OFF'));
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
			$('#textInputContainer .textInputUI').prop({
				placeholder: $.i18n('TEXT_AND_ENTER')
			})
			$('html').i18n();
		});
	});
	
}