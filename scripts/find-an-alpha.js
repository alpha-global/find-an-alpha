
// Extend Polymer.Element base class
FindAnAlpha = Polymer({

	is: 'find-an-alpha',

	properties: {
		apiKey: {
			type: String,
			value : 'AIzaSyCliv-zsZo4mT5elv3DNAnSmjO404plV50'
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
		submitting: {
			type: Boolean,
			value: false
		},
		localities: {
			type: Array,
			value: null
		},
		localitiesLabel: {
			type: String,
			value: "Province"
		},
		postalZipLabel: {
			type: String,
			value: "Postal Code"
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
		city: String,
		postalFormatRegex: String

	},

	listeners: {
		'domchanged': '_adjustHeight'
	},

	ready: function () {

		var self = this;

		var provField = this.querySelector('#province');
		if (provField) {
			provField.onchange = function () {
				self.$.errorMessage.innerHTML = "";
			};
		}

	},
	attached: function () {
		var provField = this.querySelector('#province');

		if (this.city || (provField && provField.value)) {
			this.submitForm();
		}

	},

	shareLocation: function () {
		var self = this;
		this.submitting = true;
		var geo = this.$.geo = document.createElement("geo-location");
		geo.latitude = this.latitude;
		geo.longitude = this.longitude;

		geo.addEventListener("latitude-changed", function (ev) {
			self.latitude = this.latitude;
		});

		geo.addEventListener("longitude-changed", function (ev) {
			self.longitude = this.longitude;
		});

		this.$.search.appendChild(geo);

		self.geoHandler = function (e) {
			var request = this.querySelector('#geo-search')
			var form = this.querySelector('form');
			var data = form.serialize();
			delete data.cityorpostalcode;
			delete data.province;
			data.latitude = e.detail.latitude;
			data.longitude = e.detail.longitude;
			request.params = data;
			request.lastResponse = this.resultList;
			request.addEventListener('response', self.onResult.bind(self));
			request.generateRequest();
			self.foundGeo = true;
		};

		this.$.search.addEventListener('geo-response', self.geoHandler);

	},
	submitForm: function () {
		var self = this;
		var form = this.querySelector('form');
		var cityorpostalcode = this.$.cityorpostalcode.value;
		var hasCityorpostalcode = cityorpostalcode !== "";
		var isPostalCode = this._isPostalCode(cityorpostalcode);
		var isTryingPostal = new RegExp(/\d/).test(cityorpostalcode);
		var hasProvince = this.querySelector('#province').value !== "";

		if (isTryingPostal && !isPostalCode) {
			this.$.errorMessage.innerHTML = "Please enter a valid " + this.postalZipLabel + "";
			return;
		} else if (!isPostalCode && !hasProvince && hasCityorpostalcode) {
			this.$.errorMessage.innerHTML = "Please enter a " + this.localitiesLabel + " to continue.";
			return;
		}
		if (isPostalCode) {
			this.$.cityorpostalcode.name = "postalCode";
		} else {
			this.$.cityorpostalcode.name = "city";
		}
		form.submit();
		form.addEventListener('iron-form-response', self.onResult.bind(self));
		form.addEventListener('iron-form-error', self._onError.bind(self));
		self.foundGeo = false;
	},

	onResult: function (event) {
		this.submitting = false;
		if (this.$.geo) {
			this.$.geo.remove();
		}
		this.$.search.removeEventListener('geo-response', this.geoHandler);
		this.count = event.detail.response.count;
		this.measurementUnits = event.detail.response.radius.units;

		if (this.foundGeo) {
			this._getAddress(event.detail.response.locations[0]);
		}

		if (this.count === 0) {

			this.$.errorMessage.innerHTML = "We couldn't find any Alphas matching your search criteria. Please broaden your search radius and try again.";
			return;
		}

		var pages = this.querySelector('iron-pages');
		pages.select(1);
		this.resultList = event.detail.response.items;

		var map = this.querySelector('google-map');
		var selector = this.querySelector('google-map iron-selector');
		var markers = this.querySelector('google-map-marker');
		if (markers) {
			selector.removeChild(markers);
		}

		map.removeAttribute('zoom');
		map.setAttribute('fit-to-markers', true);
		this._setAllMarkers();
	},

	onCityKeyUp: function (event, detail) {

		var value = this.$.cityorpostalcode.value;

		var isPostalCode = this._isPostalCode(value);
		var isTryingPostal = new RegExp(/\d/).test(value);

		var message = '';
		if (isTryingPostal && !isPostalCode) {
			message = "Please enter a valid " + this.postalZipLabel + "";

		}
		this.$.errorMessage.innerHTML = message;
	},


	backToSearch: function () {
		var resultPage = this.querySelector('neon-animated-pages');
		resultPage.select(0);
		var pages = this.querySelector('iron-pages');
		pages.select(0);
		this.$.errorMessage.innerHTML = "";
		this._setDefaultMarker();
		resultPage = this.querySelector('neon-animated-pages').select(0);
		if (this.foundGeo && this.city) {
			this.$.cityorpostalcode.value = this.city;
		}
	},

	_onMarkerClick: function (marker) {
		var mark = marker.label;
		var index = Number(mark - 1);
		this.selected = this.resultList[index];
		var pages = this.querySelector('iron-pages');
		pages.select(1);
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
		var self = this;
		var map = this.querySelector('google-map');
		var cluster = this.querySelector('google-map-markerclusterer');
		cluster.markers = [];

		var mark = Number(index) + 1;
		var element = self.resultList[index];
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
		var gmap = this.querySelector('google-map');
		gmap.map.fitBounds(bounds);

		var curZoom = gmap.map.getZoom();
		if (this.maxZoom && curZoom > this.maxZoom) {
			gmap.map.setZoom(this.maxZoom);
		}

		this.querySelector('google-map-markerclusterer').map = gmap.map;
		this.querySelector('google-map-markerclusterer').markers = markers;
	},

	_setDefaultMarker: function () {
		var self = this;
		var map = this.$$('google-map');

		if (self.foundGeo === true) {
			self._setAllMarkers();

			return;
		}
		self.querySelector('google-map-markerclusterer').markers = [];
		map.setAttribute('latitude', this.latitude);
		map.setAttribute('longitude', this.longitude);
		map.setAttribute('zoom', this.zoom);
		map.removeAttribute('fit-to-markers');
	},



	_adjustHeight: function (event) {

		if (screen.width < 768) {
			var el = event.target;//this.$$('list-view')
			var biggestHeight = 0;
			// Loop through elements children to find & set the biggest height

			Polymer.dom(el).node.childNodes.forEach(function (element) {

				biggestHeight = biggestHeight + element.offsetHeight;

			});

			// Set the container height
			Polymer.dom(el).parentNode.style.height = biggestHeight + "px";
		}
	},

	_isPostalCode: function (postal) {

		if (this.postalFormatRegex) {
			var rgx = eval(this.postalFormatRegex);//
			return rgx.test(postal);
		}
		return false;
	},

	_onError: function () {
		this.$.errorMessage.innerHTML = "Hmm... we can't find that location. Please try again.";
	},
	_getAddress: function (results) {
		var self = this;
		for (var i = 0; i < results.address_components.length; i++) {
			if (results.address_components[i].types[0] == "locality") {
				//this is the object you are looking for
				self.city = results.address_components[i].long_name;
			}
			if (results.address_components[i].types[0] == "administrative_area_level_1") {
				//this is the object you are looking for
				self.province = results.address_components[i].long_name;
			}
		}
	}

});

