
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
       
        // animationConfig:{
        //   value:function(){
        //     return{
        //       'entry':{
        //         name:"scale-up-animation",
        //         node:this.$.result
        //       }
        //     }
        //   }
        // }
      },

      listeners:{
        'domchanged':'_adjustHeight',
      },

      ready: function() {
        var self = this;
        this.querySelector('#province').onchange = function(){
          self.querySelector("#errorProvince").innerHTML=""; 
        }
        this.querySelector('#cityorpostalcode').oninput = function(){
          self.querySelector("#errorCity").innerHTML=""; 
        }
        // var map = this.querySelector('google-map');
        // map.setAttribute('fit-to-markers',true);
        // var pages = this.querySelector('iron-pages');
        // document.addEventListener('click', function(e) {
        //   pages.selectNext();
        // });
        // if(this.animationConfig == undefined){
        //   this.animationConfig = {
        //     'enter':{
        //       name:"scale-down-animation",
        //       node:this.$.result,
        //       transformOrigin: '50% 50%',
        //       axis: 'y',
        //     }
        //   };
        // }       
      },

      shareLocation:function(){
        var self = this;
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
        }
        this.$.search.addEventListener('geo-response', self.geoHandler);


       

        // latitudeChanged: function(newLat, newLng){
        //   if (this.$.geo){
        //     this.$.geo
        //   }
        // }

      },



     submitForm:function() {
       var self = this;
       var form = this.querySelector('form');
       var cityorpostalcode = this.querySelector('#cityorpostalcode');
       var hasCityorpostalcode =  this.querySelector('#cityorpostalcode').value !== "";
       var isPostalCode = this._isPostalCode(cityorpostalcode.value);
       var hasProvince = this.querySelector('#province').value !== "";
       if (!isPostalCode && !hasProvince && hasCityorpostalcode ){
         self.querySelector("#errorProvince").innerHTML="Please select a province!"; 
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
    },

    onResult: function(event){
      if (this.$.geo){
        this.$.geo.remove();
      }
      this.$.search.removeEventListener('geo-response', this.geoHandler);
      this.count = event.detail.response.count;
      if (this.count === 0){
        //console.log( this.$.searchError);
        this.$.searchError.innerHTML = "<p>Broaden your search radius to find more Alphas.</p>";
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
      //console.log(event.detail.response);
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
        var resultPage = this.querySelector('neon-animated-pages').select(0);

      },

      _onMarkerClick:function(mark){
        var index = Number(mark-1);
        this.selected = this.resultList[ index];
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
         map.map.setZoom(17);
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
              self._markerSelected(index);
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
        this.querySelector('google-map-markerclusterer').markers = [];
        map.setAttribute('latitude', 62.522530);
        map.setAttribute('longitude', -100.924611);
        map.setAttribute('zoom', 3); 
        map.removeAttribute('fit-to-markers');       
    },

    _computeDistance:function(el){
      var self= this;
      var lat1 = el.lat;
      var lat2 = self.latitude;
      var lng1 = el.lng;
      var lng2 = self.longitude;
      var location1 = new google.maps.LatLng(lat1, lng1);
      var location2 = new google.maps.LatLng(lat2, lng2);
      var d = google.maps.geometry.spherical.computeDistanceBetween(location1, location2);
      // var R = 6371e3; // metres
      // var φ1 = lat1* Math.PI / 180;
      // var φ2 = lat2* Math.PI / 180;
      // var Δφ = (lat2-lat1)* Math.PI / 180;
      // var Δλ = (lon2-lon1)* Math.PI / 180;

      // var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
      //         Math.cos(φ1) * Math.cos(φ2) *
      //         Math.sin(Δλ/2) * Math.sin(Δλ/2);
      // var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      var d = d/1000;
      d = Number(Math.round(d+'e2')+'e-2');
      // // console.log(lat1 + "," + lon1 + "and" + lat2 + "," + lon2 +"distance:" + d);
      return d +'km';
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
       this.querySelector("#errorCity").innerHTML="Not valid!"; 
     }

    })
     //var el2 = new FindAnAlpha();
    // Register custom element definition using standard platform API
    // customElements.define(FindAnAlpha.is, FindAnAlpha);
