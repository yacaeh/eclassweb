window.language = 'ko'; //Global variable declaration with window.
window.i18n
function updateLanguage(){
	console.log("Update language on change!");
	jQuery(function($) {
		window.i18n = $.i18n()
		window.language = $( '.language option:selected' ).val();
		window.i18n.locale = window.language;
		window.i18n.load( '/dashboard/js/languages/' + i18n.locale + '.json', i18n.locale )
		.done(function() {
			$( "title" ).prop( {
				text: $.i18n( 'TITLE' )
			});
	
			$( '#txt-roomid' ).prop( {
				placeholder: $.i18n( 'ROOM_NUMBER' )
			});
	
			$( '#txt-user-name' ).prop( {
				placeholder: $.i18n( 'NAME' )
			});
	
			$( '#txt-room-password' ).prop( {
				placeholder: $.i18n( 'PASSWORD' )
			});

			$('.conversation-panel .emojionearea-editor').prop({
				placeholder: $.i18n( 'CHAT_PLACEHOLDER' ),
			});

			$( '#exam-time' ).prop( {
				placeholder: $.i18n( 'QUIZ_MINUTES' )
			});

			$( '#urlform #urlinput' ).prop( {
				placeholder: $.i18n( 'ENTER_URL' )
			});
			console.log("Placeholder for chat");
			$('#txt-chat-message .emojionearea .emojionearea-editor').prop({
				placeholder: $.i18n( 'CHAT_PLACEHOLDER' ),
			});
			topButtonContents.top_all_controll = $.i18n( 'MANAGE_ALL' );
			topButtonContents.top_test = $.i18n( 'TOP_QUIZ' );
			topButtonContents.top_alert = $.i18n( 'TOP_NOTIFY' );
			topButtonContents.top_student = $.i18n( 'TOP_STUDNET_CANVAS' );
			topButtonContents.top_camera = $.i18n( 'TOP_CAMERA' );
			topButtonContents.top_save_alert = $.i18n( 'TOP_SAVE_ALERT' );
			topButtonContents.top_record_video = $.i18n( 'TOP_RECORD_VIDEO' );
			
			GetWidgetFrame().updateLanguage();
			$('html').i18n();
			console.log("Load Language!");
		});
	});

}

updateLanguage();
console.log("updatLanguage");
console.log(window.self);
console.log(window.self);
console.log(window.iAmGlobal);