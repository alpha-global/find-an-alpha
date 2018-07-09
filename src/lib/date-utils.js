
( function () {

	var CURRENT_LOCALE;

	function IntlFormatOptions ( format ) {
		this.parse( format );
	}


	IntlFormatOptions.prototype.parse = function ( format ) {
		let fmtObj = {}

		if ( format.indexOf( "YYYY" ) >= 0 ) {
			fmtObj.year = "numeric";
		} else if ( format.indexOf( "YY" ) >= 0 ) {
			fmtObj.year = "2-digit";
		}

		if ( format.indexOf( "MMMM" ) >= 0 ) {
			fmtObj.month = "long";
		} else if ( format.indexOf( "MM" ) >= 0 ) {
			fmtObj.month = "2-digit";
		}

		if ( format.indexOf( "Do" ) >= 0 ) {
			fmtObj.day = "numeric";
		} else if ( format.indexOf( "DD" ) >= 0 ) {
			fmtObj.day = "2-digit";
		}

		if ( format.indexOf( "JJ" ) >= 0 ) {
			fmtObj.weekday = 'long';
		}

		if ( format.indexOf( 'H' ) >= 0 ) {
			fmtObj.hour = 'numeric';
		}
		if ( format.indexOf( 'i' ) >= 0 ) {
			fmtObj.minute = 'numeric';
		}

		if ( format.indexOf( 'z' ) >= 0 ) {
			fmtObj.timeZoneName = 'short';
		}
		if ( format.indexOf( 'Z' ) >= 0 ) {
			fmtObj.timeZoneName = 'long';
		}

		if ( format.indexOf( 'UTC' ) >= 0 ) {
			fmtObj.timeZone = 'UTC';
		}

		//default is true
		if ( format.indexOf( 'a' ) < 0 ) {
			fmtObj.hour12 = false;
		}

		for ( var prop in fmtObj ) {
			this[ prop ] = fmtObj[ prop ];
		}
	}

	window.dateFormat = function ( value, format, locale ) {
		var fmtObj = new IntlFormatOptions( format );

		var transformed = new Intl.DateTimeFormat( locale || CURRENT_LOCALE, fmtObj ).format( value );

		return transformed;
	}
	window.dateSetLocale = function ( locale ) {
		CURRENT_LOCALE = locale;
	}
	window.getDateLocale = function () {
		return CURRENT_LOCALE;
	}

	window.isLocaleEnglish = function () {
		return CURRENT_LOCALE.indexOf( 'en' ) === 0;
	}

	window.isRTL = function ( locale ) {
		var isrtl =
			[
				'ae',	/* Avestan */
				'ar',   /* 'العربية', Arabic */
				'arc',  /* Aramaic */
				'bcc',  /* 'بلوچی مکرانی', Southern Balochi */
				'bqi',  /* 'بختياري', Bakthiari */
				'ckb',  /* 'Soranî / کوردی', Sorani */
				'dv',   /* Dhivehi */
				'fa',   /* 'فارسی', Persian */
				'glk',  /* 'گیلکی', Gilaki */
				'he',   /* 'עברית', Hebrew */
				'ku',   /* 'Kurdî / كوردی', Kurdish */
				'mzn',  /* 'مازِرونی', Mazanderani */
				'nqo',  /* N'Ko */
				'pnb',  /* 'پنجابی', Western Punjabi */
				'ps',   /* 'پښتو', Pashto, */
				'sd',   /* 'سنڌي', Sindhi */
				'ug',   /* 'Uyghurche / ئۇيغۇرچە', Uyghur */
				'ur',   /* 'اردو', Urdu */
				'yi'    /* 'ייִדיש', Yiddish */
			].indexOf( locale || CURRENT_LOCALE ) >= 0;
		return isrtl;
	}
} )();

