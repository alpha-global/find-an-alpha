
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
        resultList: {
          type: Array,
          notify: true,
          // reflectToAttribute: true
        },
        selected: {
          type: Object,
          notify: true,
        },
        api: {
          type:String,
          notify:true,
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
        'domchanged':'_adjustHeight',
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

      shareLocation:function(){
        var self = this;
        this.submitting = true;
        var geo = this.$.geo = document.createElement("geo-location");
        geo.latitude = this.latitude;
        geo.longitude = this.longitude;

        geo.addEventListener("latitude-changed", function(ev){
          self.latitude = this.latitude; 
        })

         geo.addEventListener("longitude-changed", function(ev){
          self.longitude = this.longitude;
        })


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
         cityorpostalcode.name = "postalCode"
       }else{
         cityorpostalcode.name = "city"
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
        //console.log( this.$.searchError);
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
      // this.hasDistance = false;
      
      // if ( event.detail.response.locations.length !== 0){
      //     this.hasDistance = true;
      //     this.latitude = event.detail.response.locations[0].geometry.location.lat;
      //     this.longitude = event.detail.response.locations[0].geometry.location.lng;
      // }
      if(self.foundGeo){
        self._getAddress(event.detail.response.locations[0]);
      }
      var map = this.querySelector('google-map');
      var selector = this.querySelector('google-map iron-selector');
      var markers = this.querySelector('google-map-marker');
      if(markers){
        selector.removeChild(markers);
      }
      // map.setAttribute('latitude', Number(this.resultList[0].lat));
      // map.setAttribute('longitude', Number(this.resultList[0].lng));
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
        var resultPage = this.querySelector('neon-animated-pages').select(0);
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
      
      // _textValue:function(){
      //   console.log(this.selectedIndex);
      // },

      _markerSelected:function(index){
         var self = this;
        var map = this.querySelector('google-map');
        var cluster =  this.querySelector('google-map-markerclusterer');
        cluster.markers = [];
        //var bounds = new google.maps.LatLngBounds();
           var mark = Number(index) + 1;
           element = self.resultList[index];
          var myLatLng = new google.maps.LatLng(element.lat, element.lng)
          newmarker = new google.maps.Marker({
            position: myLatLng,
            label: String(mark)
          })
          //bounds.extend(newmarker.getPosition());
         //map.map.fitBounds(bounds);
         map.map.setZoom(14);
         map.setAttribute('latitude',element.lat);
         map.setAttribute('longitude',element.lng);
          cluster.map = map.map;
         cluster.markers = [newmarker];
      },

      _setAllMarkers:function(){
        var self = this;
        var map = this.querySelector('google-map');
        var markers = [];
        var bounds = new google.maps.LatLngBounds();
        this.resultList.forEach(function(element, index) {
          // element.distance = "";
          // if (self.hasDistance){
          //   element.distance = self._computeDistance(element);
          // }
          // var marker = document.createElement('google-map-marker');
           var mark = Number(index) + 1;
           self.resultList[index].mark = mark;
          // marker.setAttribute('latitude', element.lat);
          // marker.setAttribute('longitude', element.lng);
          // marker.setAttribute('animation',"drop");
          // marker.setAttribute('label',mark);           
          // marker.addEventListener('google-map-marker-click', self._onMarkerClick.bind(self));
          // marker.setAttribute('click-events', true);
          // Polymer.dom(map).appendChild(marker);
          var myLatLng = new google.maps.LatLng(element.lat, element.lng)
          newmarker = new google.maps.Marker({
            position: myLatLng,
            label: String(mark)
          })
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
        this.querySelector('google-map-markerclusterer').map = gmap.map;
         this.querySelector('google-map-markerclusterer').markers = markers;
    },
    
    _setDefaultMarker:function(){
       var self = this;
        var map = this.$$('google-map');
        // var markers = Polymer.dom(map).childNodes;
        // while(Polymer.dom(map).firstChild){
        //   Polymer.dom(map).removeChild(Polymer.dom(map).firstChild);
        // };
        // var marker = document.createElement('google-map-marker');
        if (self.foundGeo === true){
          self._setAllMarkers();
        //   var cluster =  this.querySelector('google-map-markerclusterer');
        //   var myLatLng = new google.maps.LatLng(self.latitude, self.longitude)
        //   newmarker = new google.maps.Marker({
        //       position: myLatLng
        //   })
        //   //bounds.extend(newmarker.getPosition());
        //  //map.map.fitBounds(bounds);
        //  map.map.setZoom(12);
        //  map.setAttribute('latitude',self.latitude);
        //  map.setAttribute('longitude',self.longitude);
        // cluster.map = map.map;
        //  cluster.markers = [newmarker]; 
        //    //Polymer.dom(map).appendChild(marker);
        //     //map.map.setZoom(4);         
           return;
        }
        self.querySelector('google-map-markerclusterer').markers = [];
        map.setAttribute('latitude', 62.522530);
        map.setAttribute('longitude', -100.924611);
        map.setAttribute('zoom', 3); 
        map.removeAttribute('fit-to-markers');       
    },



    _adjustHeight:function(event){
      var self = this;
      if(screen.width < 768){
        var el = event.target;//this.$$('list-view')
        var biggestHeight = 0;
      // Loop through elements children to find & set the biggest height
      console.log(Polymer.dom(el).node.childNodes)
      Polymer.dom(el).node.childNodes.forEach(function(element){
        console.log(element.offsetHeight);
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
       for (var i=0; i<results.address_components.length; i++)
            {
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

    })
     //var el2 = new FindAnAlpha();
    // Register custom element definition using standard platform API
    // customElements.define(FindAnAlpha.is, FindAnAlpha);
