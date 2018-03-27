
// Extend Polymer.Element base class
FindAnAlpha = Polymer( {

	is: 'find-an-alpha',

	properties: {
		apiKey: {
			type: String,
			value: 'AIzaSyCliv-zsZo4mT5elv3DNAnSmjO404plV50'
		},
		latitude: {
			type: Number,
			value: 62.522530,
			notify: true,
			reflectToAttribute: true
		},
		longitude: {
			type: Number,
			value: -100.924611,
			notify: true,
			reflectToAttribute: true
		},
		zoom: {
			type: Number,
			value: 3,
			notify: true,
			reflectToAttribute: true
		},
		maxZoom: {
			type: Number,
			value: null,
			notify: true,
			reflectToAttribute: true
		},
		resultList: {
			type: Array,
			notify: true,
			value: []
		},
		selected: {
			type: Object,
			notify: true
		},
		api: {
			type: String,
			notify: true
		},
		map: {
			type: Object,
			value: null
		},
		agesLabel: {
			type: String,
			value: "Audience"
		},
		languages: {
			type: Array,
			value: null
		},
		ages: {
			type: Array,
			value: null
		},
		radiuses: {
			type: Array,
			value: null
		},
		dates: {
			type: Array,
			value: null
		},
		placesOptions: {
			type: Object,
			value: {}
		},
		geocodeQuery: {
			type: String,
			value: null,
		},
		isLoading: {
			type: Boolean,
			value: false
		},
		siteTitle: {
			type: String,
			value: 'Alpha'
		},
		i18nLocale: {
			type: String,
			value: 'en'
		},
		i18n: {
			type: Object,
			value: function ( inputs ) {
				var defaults = {
					findAddressPlaceholder: 'Enter a city or address to search nearby',
					findLocationButton: 'Find My Location',
					findLabelStartingIn: 'Starting in',
					findLabelLanguage: 'Language',
					findLabelAge: 'Age',
					findLabelRadius: 'Radius',
					findEditSearchButton: 'Edit Search',
					findBackButton: 'Back',
					errorGeoLocation: "We can't find Alphas near you without your location. You can enable browser location by clicking on the info icon to left of your address bar.",
					errorNoResults: "We couldn't find any Alphas matching your search criteria. Please broaden your search radius and try again."
				};
				for ( var id in defaults ) {
					inputs.i18n[ id ] = inputs.i18n[ id ] || defaults[ id ];
				}
				return defaults;
			}
		},
	},

	triggerResize: function () {

		var viewHeight = screen.availHeight;

		this.style.height = viewHeight + 'px';

		var resizeEvent = {
			height: this.$.viewPanel.clientHeight
		};
		parent.postMessage( resizeEvent, '*' );
	},

	ready: function () {

		if ( this.i18nLocale ) {
			dateSetLocale( this.i18nLocale );
		}

		// if there's a places query, go to that view first to avoid a flash of search form
		if ( this.geocodeQuery ) {
			this.$.ironPages.select( 1 );
		}


		window.addEventListener( 'message', this.onRecieveMessage.bind( this ) );

		// store the _onIronSelect behavior so we can cancel it in our mobile view
		this._neonIronSelect = this.$.list._onIronSelect;

		// media query listener 
		var mql = window.matchMedia( '(max-width: 767px)' );
		mql.addListener( this.onMediaQuery.bind( this ) );
		this.onMediaQuery( mql );

	},

	onRecieveMessage: function ( event ) {
		//console.info(event);
		if ( event.data.action === 'resize' ) {
			var winW = event.data.windowWidth,
				winH = event.data.windowHeight;

			this.isLandscape = winW > winH;
			if ( this.isLandscape && winW < 500 ) {
				this.$.googleMap.style.maxHeight = winH + 'px';
			} else {
				this.$.googleMap.style.maxHeight = '';
			}

			this.triggerResize();
		}

	},
	onMediaQuery: function ( event ) {
		if ( event.matches ) {
			this.$.list._onIronSelect = function () {
				this._completeSelectedChanged();
			}
		} else {
			this.$.list._onIronSelect = this._neonIronSelect;
		}
	},

	_mapsReady: function () {

		this.autoComplete = new google.maps.places.Autocomplete( this.$.placesSearch, this.placesOptions );

		this.autoComplete.bindTo( 'bounds', this.map );

		this.autoComplete.addListener( 'place_changed', this._onPlaceSelected.bind( this ) );

		/**
		 * If an initial query was passed in, do it
		 */
		if ( this.geocodeQuery ) {

			var geoCoder = new google.maps.Geocoder();

			geoCoder.geocode( {
				address: this.geocodeQuery
			}, this._onInitialGeoCode.bind( this ) );
		}
	},
	_onInitialGeoCode: function ( results, status ) {

		if ( status == google.maps.GeocoderStatus.OK ) {

			if ( status != google.maps.GeocoderStatus.ZERO_RESULTS ) {
				var result = results[ 0 ];
				this.search_latitude = result.geometry.location.lat();
				this.search_longitude = result.geometry.location.lng();

				this.geocodeQueryResult = result;

				this.submitForm();

			} else {
				this.$.listView.showEmptyGeoQuery( this.geocodeQuery );
			}
		} else if ( status === google.maps.GeocoderStatus.ZERO_RESULTS ) {
			this.$.listView.showEmptyGeoQuery( this.geocodeQuery );
		}
	},

	_onPlaceSelected: function () {

		var place = this.autoComplete.getPlace();

		this.search_latitude = place.geometry.location.lat();
		this.search_longitude = place.geometry.location.lng();

		this.submitForm();

	},

	shareLocation: function () {
		this.$.placesSearch.value = '';

		if ( this.geoEvent ) {
			this.onGeoLocate( this.geoEvent );
		}

		this.$.geoLocation.idle = false;

	},
	onGeoLocate: function ( event ) {
		this.geoEvent = event;

		this.search_latitude = event.detail.latitude;
		this.search_longitude = event.detail.longitude;

		this.submitForm();
	},
	onGeoError: function ( event ) {
		if ( event.detail.code === 1 ) {
			// user said no
			this.$.errorMessage.innerHTML = this.i18n.errorGeoLocation;
			this.$.errorMessage.hidden = false;
		}
	},
	submitForm: function () {

		if ( !this.search_latitude ) {
			return;
		}

		this.isLoading = true;
		this.$.searchForm.submit();

	},

	onResult: function ( event ) {
		this.isLoading = false;
		this.loadedOnce = true;

		this.count = event.detail.response.count;
		this.measurementUnits = event.detail.response.radius.units;

		this.$.markerClusterer.markers = [];

		if ( this.count === 0 ) {

			// if there were no results from the initial geo query, set an empty flag on the list view to display the error
			if ( this.geocodeQueryResult ) {
				this.$.listView.showEmptyGeoQuery( this.geocodeQuery );
				this.geocodeQueryResult = null;
				this.search_latitude = null;
				this.search_longitude = null;
			}

			this.$.errorMessage.innerHTML = this.i18n.errorNoResults;
			this.$.errorMessage.hidden = false;
			this.triggerResize();
			return;
		}

		this.resultList = event.detail.response.items;

		this.$.ironPages.select( 1 );

		this._setAllMarkers();

	},

	backToSearch: function () {

		// reset list view
		this.$.list.select( 0 );
		// go to search form
		this.$.ironPages.select( 0 );
		// clear message
		this.$.errorMessage.innerHTML = "";
		this.$.errorMessage.hidden = true;

		this._onClose();

	},

	_onMarkerClick: function ( marker ) {

		var mark = marker.label;
		var index = Number( mark - 1 );
		this.selected = this.resultList[ index ];

		this.$.ironPages.select( 1 );
		this.$.list.selected = 1;
		this._markerSelected( index );

	},

	_onItemClick: function ( event, argument ) {

		this.$.list.selected = 1;
		this._markerSelected( argument.index );

	},

	_onClose: function () {

		this.$.list.selected = 0;
		this._setAllMarkers();
		var locations = this.querySelectorAll( "#location" );
		for ( i = 0; i < locations.length; i++ ) {
			locations[ i ].style.visibility = "visible";
		}
		this.$.backToList.hidden = true;

	},

	_markerSelected: function ( index ) {

		var map = this.$.googleMap;
		var cluster = this.$.markerClusterer;
		cluster.markers = [];

		var mark = Number( index ) + 1;
		var element = this.resultList[ index ];
		var myLatLng = new google.maps.LatLng( element.lat, element.lng )
		var newmarker = new google.maps.Marker( {
			position: myLatLng,
			label: String( mark )
		} );

		map.map.setZoom( 14 );
		map.setAttribute( 'latitude', element.lat );
		map.setAttribute( 'longitude', element.lng );
		cluster.map = map.map;
		cluster.markers = [ newmarker ];

		this.$.backToList.hidden = false;
	},

	_setAllMarkers: function () {

		if ( !this.resultList.length ) {
			return;
		}
		var self = this;

		var markers = [];
		var bounds = new google.maps.LatLngBounds();
		this.resultList.forEach( function ( element, index ) {

			var mark = Number( index ) + 1;
			self.resultList[ index ].mark = mark;

			var myLatLng = new google.maps.LatLng( element.lat, element.lng );
			var newmarker = new google.maps.Marker( {
				position: myLatLng,
				label: String( mark )
			} );
			newmarker.addListener( 'click', function () {

				self._onMarkerClick( this );

			} );
			markers[ index ] = newmarker;
			bounds.extend( newmarker.getPosition() );
		} );
		var gmap = this.$.googleMap;
		gmap.map.fitBounds( bounds );

		var curZoom = gmap.map.getZoom();
		if ( this.maxZoom && curZoom > this.maxZoom ) {
			gmap.map.setZoom( this.maxZoom );
		}

		this.$.markerClusterer.map = gmap.map;
		this._refreshMarkCluster( markers );

	},
	_refreshMarkCluster: function ( markers ) {
		// set the markers once the map is idle, ensures proper clustering
		var _this = this,
			func = function () {

				_this.$.markerClusterer.markers = markers;
				google.maps.event.removeListener( listener );
			},
			listener = this.map.addListener( 'idle', func );
	},

	_onError: function ( error ) {
		this.isLoading = false;
		this.$.errorMessage.innerHTML = error.message || 'There was an error.';
		this.$.errorMessage.hidden = false;
		this.triggerResize();
	},

} );

