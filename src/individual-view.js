Polymer( {
	is: 'individual-view',
	behaviors: [
		Polymer.NeonAnimatableBehavior
	],
	properties: {
		sharedElements: {
			type: Object,
			value: function() {
				return {
					'hero': this.$.main
				};
			}
		},
		animationConfig: {
			type: Object,
			value: function() {
				return {
					'entry': [ {
						name: 'hero-animation',
						id: 'hero',
						toPage: this
					} ],
					'exit': [ {
						name: 'scale-down-animation',
						node: this.$.main,
						transformOrigin: '50% 50%',
						axis: 'y'
					} ]
				}
			}
		},
		timeDisplay: {
			type: String,
			computed: '_formatTimeDisplay(selected.date)'
		},
		date: {
			type: String,
			computed: '_formatDate(selected.date)'
		},
		distance: {
			type: String,
			computed: '_formatDistance( selected.distance )'
		},
		selected: {
			type: Object
		},
		siteTitle: {
			type: String,
			value: 'Alpha'
		},
		hasCalendarDownload: {
			type: String
		},
		contactApi: {
			type: String
		},
		i18n: {
			type: Object,
			value: function( inputs ) {
				var defaults = {
					findDetailType: 'Type',
					findDetailLocation: 'Location',
					findDetailMoreInfo: 'Additional Information',
					findDetailEmail: 'Email',
					findDetailPhone: 'Phone',
					findMoreInfo: 'For more information about this Alpha, please contact the organizer below.',
					findContactButton: 'Contact',
					findICalButton: 'Download iCal'
				};
				for ( var id in defaults ) {
					inputs.i18n[ id ] = inputs.i18n[ id ] || defaults[ id ];
				}
				return defaults;
			}
		},

	},
	ready: function() {
		this.showCalendarDownload = this.hasCalendarDownload === 'true';
	},

	_formatDistance ( distance ) {
		var fmtter = new Intl.NumberFormat( getDateLocale() );
		var parts = [ fmtter.format( distance ), this.i18n.distanceUnit ];
		if ( isRTL() ) {
			parts = parts.reverse();
		}
		return parts.join( '' );
	},

	_formatTimeDisplay: function( raw ) {
		if ( !raw ) {
			return '';
		}

		var time = Date.parse( raw );
		if ( isNaN( time ) ) {
			return '';
		}
		var date = new Date( time );
		var dow = this.i18n[ 'dow_' + date.getDay() ];
		var text = '';

		// date time formatter
		var fmtter = new Intl.DateTimeFormat( getDateLocale(), { weekday: 'long', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' } );

		// if format to parts supported then goooood
		if ( fmtter[ 'formatToParts' ] ) {
			var parts = fmtter[ 'formatToParts' ]( date );

			// dont need timezone name
			parts.pop();

			if ( dow ) {
				// replace weekday with our plural
				parts[ 0 ].value = dow;
			}
			parts = parts.map( function( item ) { return item.value } );

		}
		// if formatToParts not supported, build the string always using the @ symbol if english ( decent fallback )
		else {
			if ( !dow ) {
				dow = new Intl.DateTimeFormat( getDateLocale(), { weekday: 'long' } ).format( date );
			}
			var dtime = new Intl.DateTimeFormat( getDateLocale(), { hour: 'numeric', minute: '2-digit' } ).format( date );
			var parts = [ dow, ( isLocaleEnglish() ? ' @ ' : ' ' ), dtime ];
		}

		if ( isRTL() ) {
			parts = parts.reverse();
		}

		text = parts.join( '' );

		return text;

	},

	_formatDate: function( raw ) {

		if ( !raw ) {
			return '';
		}

		var time = Date.parse( raw );
		if ( isNaN( time ) ) {
			return '';
		}

		return dateFormat( new Date( time ), 'JJ MMMM Do, YYYY' );

	},

	_onICal: function() {
		var cal_single = ics();
		var end = new Date( this.selected.date );
		end.setHours( end.getHours() + 1 );
		var endTime = end.toLocaleString();
		var description = window.location.href.split( "?" )[ 0 ];
		cal_single.addEvent( this.selected.title, description, this.selected.formatted_address, this.selected.date, endTime );
		cal_single.download( 'alpha-event' );

		this.fire( 'iron-signal', { name: 'track-event', data: { event: "calendar", alpha: this.selected } } );
	},

	_onShowContact: function( e ) {
		this.showingContactForm = true;
		this.$.main.classList.add( 'showing-form' );
	},

	_onContactSubmit: function( e ) {

		e.preventDefault();

		this.$.contactResponseMessage.style.display = 'none';

		var name = this.$.contactName.value;
		var email = this.$.contactEmail.value;

		if ( !name ) {
			this.$.contactName.focus();
		} else if ( !email ) {
			this.$.contactEmail.focus();
		} else {

			this.classList.add( 'submitting' );
			this.$.contactForm.submit();
		}
	},
	_onContactResult: function( event ) {

		this.classList.remove( 'submitting' );
		var response = event.detail.response;

		this.$.contactName.value = '';
		this.$.contactEmail.value = '';

		this.$.contactResponseMessage.style.display = 'block';

		this.fire( 'iron-signal', { name: 'track-event', data: { event: "contact", email: response.admin_contact_email } } );

	},

	_onContactError: function( error ) {
		this.classList.remove( 'submitting' );
		console.info( error );
	}



} );