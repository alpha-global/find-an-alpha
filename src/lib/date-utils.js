
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
} )();

