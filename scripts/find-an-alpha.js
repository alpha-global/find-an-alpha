
    // Extend Polymer.Element base class
FindAnAlpha = Polymer  ({

	is: 'find-an-alpha',

	properties: {
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
			type:String,
			notify:true
		},
		map: {
			type:Object,
			value:null
		},
		submitting:{
			type:Boolean,
			value:false
		},
		localities : {
			type : Array,
			value : null
		},
		localitiesLabel : {
			type : String,
			value : "Province"
		},
		postalZipLabel : {
			type : String,
			value : "Postal Code"
		},
		languages : {
			type : Array,
			value : null
		},
		radiuses : {
			type : Array,
			value : null
		},
		city : String

	},

	listeners:{
		'domchanged' : '_adjustHeight'
	},

	ready: function() {

		var self = this;

		var provField = this.querySelector('#province');
		if(provField){
			provField.onchange = function(){
			  self.querySelector("#errorProvince").innerHTML="";
			  self.querySelector("#errorCity").innerHTML=""; 
			};
		}

		var cityField = this.querySelector('#cityorpostalcode');
		if(cityField){
			cityField.oninput = function(){
			  self.querySelector("#errorCity").innerHTML=""; 
			   self.querySelector("#errorProvince").innerHTML="";
			};
		}

	},
	attached : function(){
		var provField = this.querySelector('#province');

		if(this.city || (provField && provField.value)){
			this.submitForm();
		}

	},

	shareLocation : function(){
		var self = this;
		this.submitting = true;
		var geo = this.$.geo = document.createElement("geo-location");
		geo.latitude = this.latitude;
		geo.longitude = this.longitude;

		geo.addEventListener("latitude-changed", function(ev){
			self.latitude = this.latitude; 
		});

		geo.addEventListener("longitude-changed", function(ev){
			self.longitude = this.longitude;
		});

		this.$.search.appendChild(geo);

		self.geoHandler = function(e){
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
	submitForm:function() {
		var self = this;
		var form = this.querySelector('form');
		var cityorpostalcode = this.querySelector('#cityorpostalcode');
		var hasCityorpostalcode =  this.querySelector('#cityorpostalcode').value !== "";
		var isPostalCode = this._isPostalCode(cityorpostalcode.value);
		var hasProvince = this.querySelector('#province').value !== "";
		if (!isPostalCode && !hasProvince && hasCityorpostalcode ){
			self.querySelector("#errorProvince").innerHTML="Please enter a "+this.localitiesLabel+" to continue."; 
			return;  
		}
		if (isPostalCode){
			cityorpostalcode.name = "postalCode";
		}else{
			cityorpostalcode.name = "city";
		}
		form.submit();
		form.addEventListener('iron-form-response', self.onResult.bind(self));
		form.addEventListener('iron-form-error', self._onError.bind(self));
		self.foundGeo = false;
	},

	onResult: function(event){
		this.submitting = false;
		if (this.$.geo){
			this.$.geo.remove();
		}
		this.$.search.removeEventListener('geo-response', this.geoHandler);
		this.count = event.detail.response.count;
		this.measurementUnits = event.detail.response.radius.units;
		if (this.count === 0){

			this.$.searchError.innerHTML = "<p>We couldn't find any Alphas matching your search criteria. Please broaden your search radius and try again.</p>";
			return;
		}
		var self = this;
		var pages = this.querySelector('iron-pages');
		pages.select(1);
		this.resultList = event.detail.response.items;
		if (event.detail.response.count === 0){
			return;
		}

		if(self.foundGeo){
			self._getAddress(event.detail.response.locations[0]);
		}
		var map = this.querySelector('google-map');
		var selector = this.querySelector('google-map iron-selector');
		var markers = this.querySelector('google-map-marker');
		if(markers){
			selector.removeChild(markers);
		}

		map.removeAttribute('zoom');
		map.setAttribute('fit-to-markers', true);
		this._setAllMarkers();
	},


	backToSearch: function(){
		var resultPage = this.querySelector('neon-animated-pages');
		resultPage.select(0);
		var pages = this.querySelector('iron-pages');
		pages.select(0);
		this.$.searchError.innerHTML = "";
		this._setDefaultMarker();
		var self = this;
		resultPage = this.querySelector('neon-animated-pages').select(0);
		if (this.foundGeo && this.city){
			this.querySelector("#cityorpostalcode").value = this.city;
			var selectObj = this.querySelector("#province");
			for (var i = 0; i < selectObj.options.length; i++) {
				if (selectObj.options[i].text== self.province) {
					selectObj.options[i].selected = true;
				}
			}
		}
	},

	_onMarkerClick:function(marker){
		var mark = marker.label;
		var index = Number(mark-1);
		this.selected = this.resultList[ index];
		var pages = this.querySelector('iron-pages');
		pages.select(1);
		this.$.list.selected = 1;
		this._markerSelected(index);

	},

	_onItemClick:function(event,argument){
		this.$.list.selected = 1;
		this._markerSelected(argument.index);

	},

	_onClose:function(){
		this.$.list.selected = 0;
		this._setAllMarkers();
		var locations = this.querySelectorAll("#location");
		for (i = 0; i < locations.length; i++) {
			locations[i].style.visibility = "visible";
		}

	},

	_markerSelected:function(index){
		var self = this;
		var map = this.querySelector('google-map');
		var cluster =  this.querySelector('google-map-markerclusterer');
		cluster.markers = [];
		
		var mark = Number(index) + 1;
		var element = self.resultList[index];
		var myLatLng = new google.maps.LatLng(element.lat, element.lng)
		var newmarker = new google.maps.Marker({
			position: myLatLng,
			label: String(mark)
		});
		
		map.map.setZoom(14);
		map.setAttribute('latitude',element.lat);
		map.setAttribute('longitude',element.lng);
		cluster.map = map.map;
		cluster.markers = [newmarker];
	},

	_setAllMarkers : function(){
		var self = this;
		
		var markers = [];
		var bounds = new google.maps.LatLngBounds();
		this.resultList.forEach(function(element, index) {

			var mark = Number(index) + 1;
			self.resultList[index].mark = mark;

			var myLatLng = new google.maps.LatLng(element.lat, element.lng);
			var newmarker = new google.maps.Marker({
				position: myLatLng,
				label: String(mark)
			});
			newmarker.addListener('click', function(){
				var index = Number(mark-1);
				self.selected = self.resultList[ index];
				self.$.list.selected = 1;
				self._onMarkerClick(this);
			});
			markers[ index] =newmarker; 
			bounds.extend(newmarker.getPosition());
		});
		var gmap = this.querySelector('google-map');
		gmap.map.fitBounds(bounds);

		var curZoom = gmap.map.getZoom();
		if(this.maxZoom && curZoom > this.maxZoom){
			gmap.map.setZoom(this.maxZoom);
		}

		this.querySelector('google-map-markerclusterer').map = gmap.map;
		this.querySelector('google-map-markerclusterer').markers = markers;
	},

	_setDefaultMarker:function(){
		var self = this;
		var map = this.$$('google-map');

		if (self.foundGeo === true){
		  self._setAllMarkers();

		   return;
		}
		self.querySelector('google-map-markerclusterer').markers = [];
		map.setAttribute('latitude', this.latitude);
		map.setAttribute('longitude', this.longitude);
		map.setAttribute('zoom', this.zoom); 
		map.removeAttribute('fit-to-markers');       
	},



	_adjustHeight:function(event){
		
		if(screen.width < 768){
			var el = event.target;//this.$$('list-view')
			var biggestHeight = 0;
			// Loop through elements children to find & set the biggest height
		
			Polymer.dom(el).node.childNodes.forEach(function(element){
			  
				biggestHeight = biggestHeight + element.offsetHeight;

			});

			// Set the container height
			Polymer.dom(el).parentNode.style.height = biggestHeight+"px";
		}
	},

	_isPostalCode: function(postal){
		var canada = new RegExp(/^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]( )?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i);
		var us = new RegExp(/(^\d{5}$)|(^\d{5}-\d{4}$)/);
		return ((canada.test(postal)) || (us.test(postal)));
	},

	_onError: function(){
		this.querySelector("#errorCity").innerHTML="Hmm... we can't find that location. Please try again."; 
	},
	_getAddress:function(results){
		var self = this;
		for (var i=0; i<results.address_components.length; i++) {
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

