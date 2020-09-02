let language;
let i18n;
function updateLanguage(){
	console.log("Update called!");
	console.log(window.top.language);
	jQuery(function($) {
		i18n = $.i18n()
		language = window.top.language;
		i18n.locale = language;
		$.i18n().load( '/dashboard/js/languages/' + i18n.locale + '.json', i18n.locale )
		.done(function() {
			$('html').i18n();
		});
	});
	
}

updateLanguage();