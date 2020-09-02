let language;
let i18n;
function updateLanguage(){
	jQuery(function($) {
		i18n = $.i18n()
		language = $( '.language option:selected' ).val();
		i18n.locale = language;
		i18n.load( '/dashboard/js/languages/' + i18n.locale + '.json', i18n.locale )
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

			$('.conversation-panel .emojionearea-editor').prop( {
				placeholder: $.i18n( 'CHAT_PLACEHOLDER' )
			});

			$( '#exam-time' ).prop( {
				placeholder: $.i18n( 'QUIZ_MINUTES' )
			});

			$( '#urlform #urlinput' ).prop( {
				placeholder: $.i18n( 'ENTER_URL' )
			});

			$('html').i18n();
			console.log("Load Language!");
		});
	});
	
}

updateLanguage();

