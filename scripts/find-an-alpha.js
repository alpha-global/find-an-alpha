
// Extend Polymer.Element base class
FindAnAlpha = Polymer({

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
			notify: true
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
		radius: {
			type: String,
			value: '100km'
		},
		placesOptions: {
			type: Object,
			value: {}
		},
		placesQuery: {
			type: String,
			value: null,
		},
		isLoading: {
			type: Boolean,
			value: false
		}

	},

	listeners: {
		'domchanged': '_adjustHeight'
	},

	ready: function () {
		var mql = window.matchMedia('(max-width: 767px)');
		mql.addListener(this.onMediaQuery.bind(this));

		// if there's a places query, go to that view first to avoid a flash of search form
		if (this.placesQuery) {
			this.$.ironPages.select(1);
		}

	},
	attached: function () { },
	_mapsReady: function () {

		this.autoComplete = new google.maps.places.Autocomplete(this.$.placesSearch, this.placesOptions);

		this.autoComplete.bindTo('bounds', this.map);

		this.autoComplete.addListener('place_changed', this._onPlaceSelected.bind(this));

		/**
		 * If an initial query was passed in, do it
		 */
		if (this.placesQuery) {

			var geoCoder = new google.maps.Geocoder();

			geoCoder.geocode({
				address: this.placesQuery
			}, this._onInitialGeoCode.bind(this));
		}
	},
	_onInitialGeoCode: function (results, status) {

		if (status == google.maps.GeocoderStatus.OK) {

			if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
				var result = results[0];
				this.search_latitude = result.geometry.location.lat();
				this.search_longitude = result.geometry.location.lng();

				this.placesQueryResult = result;

				this.submitForm();

			}
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
		this.$.geoLocation.idle = false;
		this.$.geoLocation.fetch();

	},
	onGeoLocate: function (event) {
		this.search_latitude = event.detail.latitude;
		this.search_longitude = event.detail.longitude;

		this.submitForm();
	},
	onGeoError: function (event) {
		if (event.detail.code === 1) {
			// user said no
			this.$.errorMessage.innerHTML = "We can't find Alphas near you without your location. You can enable browser location by clicking on the info icon to left of your address bar.";
		}
	},
	submitForm: function () {

		if (!this.search_latitude) {
			return;
		}

		this.isLoading = true;
		this.$.searchForm.submit();

	},

	onResult: function (event) {
		this.isLoading = false;
		this.loadedOnce = true;

		this.count = event.detail.response.count;
		this.measurementUnits = event.detail.response.radius.units;

		this.$.markerClusterer.markers = [];

		if (this.count === 0) {

			// if there were no results from the initial places query, set an empty flag on the list view to display the error
			if (this.placesQueryResult) {
				this.$.listView.showEmptyPlaceQuery(this.placesQuery, this.placesQueryResult);
				this.placesQueryResult = null;
				this.search_latitude = null;
				this.search_longitude = null;
			}

			this.$.errorMessage.innerHTML = "We couldn't find any Alphas matching your search criteria. Please broaden your search radius and try again.";
			return;
		}

		this.resultList = event.detail.response.items;

		this.$.ironPages.select(1);

		this.$.googleMap.removeAttribute('zoom');
		this.$.googleMap.setAttribute('fit-to-markers', true);
		this._setAllMarkers();
	},

	backToSearch: function () {

		// reset list view
		this.$.list.select(0);
		// go to search form
		this.$.ironPages.select(0);
		// clear message
		this.$.errorMessage.innerHTML = "";

	},

	_onMarkerClick: function (marker) {
		var mark = marker.label;
		var index = Number(mark - 1);
		this.selected = this.resultList[index];

		this.$.ironPages.select(1);
		this.$.list.selected = 1;
		this._markerSelected(index);

	},

	_onItemClick: function (event, argument) {
		this.$.list.selected = 1;
		this._markerSelected(argument.index);

	},

	_onClose: function () {
		this.$.list.selected = 0;
		this._setAllMarkers();
		var locations = this.querySelectorAll("#location");
		for (i = 0; i < locations.length; i++) {
			locations[i].style.visibility = "visible";
		}

	},

	_markerSelected: function (index) {

		var map = this.$.googleMap;
		var cluster = this.$.markerClusterer;
		cluster.markers = [];

		var mark = Number(index) + 1;
		var element = this.resultList[index];
		var myLatLng = new google.maps.LatLng(element.lat, element.lng)
		var newmarker = new google.maps.Marker({
			position: myLatLng,
			label: String(mark)
		});

		map.map.setZoom(14);
		map.setAttribute('latitude', element.lat);
		map.setAttribute('longitude', element.lng);
		cluster.map = map.map;
		cluster.markers = [newmarker];
	},

	_setAllMarkers: function () {
		var self = this;

		var markers = [];
		var bounds = new google.maps.LatLngBounds();
		this.resultList.forEach(function (element, index) {

			var mark = Number(index) + 1;
			self.resultList[index].mark = mark;

			var myLatLng = new google.maps.LatLng(element.lat, element.lng);
			var newmarker = new google.maps.Marker({
				position: myLatLng,
				label: String(mark)
			});
			newmarker.addListener('click', function () {
				var index = Number(mark - 1);
				self.selected = self.resultList[index];
				self.$.list.selected = 1;
				self._onMarkerClick(this);
			});
			markers[index] = newmarker;
			bounds.extend(newmarker.getPosition());
		});
		var gmap = this.$.googleMap;
		gmap.map.fitBounds(bounds);

		var curZoom = gmap.map.getZoom();
		if (this.maxZoom && curZoom > this.maxZoom) {
			gmap.map.setZoom(this.maxZoom);
		}

		this.$.markerClusterer.map = gmap.map;
		this.$.markerClusterer.markers = markers;
	},


	onMediaQuery: function (event) {
		this._adjustHeight();
	},

	_adjustHeight: function () {

		var el = this.$.listView,// event.target,
			polyEl = Polymer.dom(el);

		if (screen.width < 768) {

			var biggestHeight = 0;
			// Loop through elements children to find & set the biggest height

			var navBar = this.querySelector('#nav-bar'),
				alerts = this.querySelector('#alerts'),
				listItems = el.querySelectorAll('#location');

			biggestHeight += navBar.offsetHeight;
			biggestHeight += alerts ? alerts.offsetHeight : 0;

			if (this.$.list.selected === 1) {

				biggestHeight += 300;

			} else {

				if (listItems.length) {
					biggestHeight += 12;
				}

				listItems.forEach(function (element) {

					biggestHeight = biggestHeight + element.offsetHeight;

				});
			}

			var height = biggestHeight > 300 ? 300 : biggestHeight;

			// Set the container height
			polyEl.parentNode.style.height = height + "px";
		} else {
			polyEl.parentNode.style.height = '';
		}
	},

	_onError: function () {
		this.isLoading = false;
		this.$.errorMessage.innerHTML = "Hmm... we can't find that location. Please try again.";
	},

});

