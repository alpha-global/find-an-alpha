// const fa = document.createElement('find-a-course');
// document.body.appendChild(fa);

import './form';
import {
	alphaWithFriendlyDateTime,
	createComponentAttribute,
	loadComponent,
	getConfig,
	getTranslation,
	isMobile,
	hideShowMap
} from './helper';
import MarkerClusterer from '@googlemaps/markerclustererplus';
import './action-bar';
import './fonts.min.css';

let googleMap;
let autocomplete;
let markerCluster;
let markers = [];

/**
 * Main Component class. Instantiates all the other components and renders it the map on the UI.
 */
class FindAlpha extends HTMLElement {

    constructor() {
        super();
        this.shadow = this.attachShadow( { mode: 'open' } );
    }

    static get observedAttributes() {
        return ['alphamarkers', 'selectedalpha']
    }

    /**
     * Gets the alpha data the user has selected to add on the map.
     * @returns Object
     */
    get selectedalpha() {
        const selAlpha = this.getAttribute('selectedalpha');
        return JSON.parse(selAlpha);
    }

    /**
     * Gets all the found alphas to display on the map. This data is parsed by the
     * `form` component as an attribute.
     * @returns Object
     */
    get alphamarkers() {
        const am = this.getAttribute('alphamarkers');
        return JSON.parse(am)
    }

    connectedCallback() {
        this.registerGoogleMaps();
        this.render();
    }

    /**
     * If an attribute changes,it verifies which one it was and executes
     * different methods. The original value can still be saved.
     * @param {*} prop 
     * @param {*} oldVal 
     * @param {*} newVal 
     */
    attributeChangedCallback(prop, oldVal, newVal) {
        if (prop === 'alphamarkers') {
            newVal ? this.setMapMarkers() : this.resetMapMarkers();
        }

        if (prop === 'selectedalpha') {
            if (newVal) {
                this.setSelectedAlphaOnMap();
            }
        }
    }

    /**
     * Resets markers on the map
     */
    resetMapMarkers() {
        if (markers.length) {
            markerCluster.removeMarkers(markers);
        }
    }

    /**
     * It uses the `alphaWithFriendlyDateTime` method that converts the
     * UNIX Date to a friendly format adding internationalization to it.
     * 
     * It will then look up for markers that has the exact same location 
     * to add a little bit of distance between them.
     */
    setMapMarkers() {
        if (!this.alphamarkers.length) {
            return;
        }
        const nAlphas = alphaWithFriendlyDateTime(this.alphamarkers);
		let bounds = new google.maps.LatLngBounds();

        let lnghash = {};

		/**
		 * Create a lookup of lat,lngs to group duplicates to spread them out
		 */
		nAlphas.forEach( ( element, index ) => {

			let myLatLng = new google.maps.LatLng( element.lat, element.lng );
			let key = element.lat + ',' + element.lng;
			if ( lnghash[ key ] ) {
				lnghash[ key ].push( element );
			} else {
				lnghash[ key ] = [ element ]
			}

        } );

		/**
		 * Go through each marker
		 */
		nAlphas.forEach( ( element, index ) => {

			let mark = Number( index ) + 1;
            nAlphas[ index ].mark = mark;

			let key = element.lat + ',' + element.lng;
			let myLatLng;

			if ( lnghash[ key ].length === 1 ) {
				myLatLng = new google.maps.LatLng( element.lat, element.lng );
			} else {
				// calculate the radius to spread them around by
                let degPerItem = 360 / lnghash[ key ].length;
                let currentEl = lnghash[key].find(f => f.id === element.id);
				let itemIndex = lnghash[key].indexOf(currentEl);
				let degs = degPerItem * itemIndex;
				let radius = 12000000;
                let distance = lnghash[ key ].length / 2;

				myLatLng = google.maps.geometry.spherical.computeOffset( new google.maps.LatLng( element.lat, element.lng ), distance, degs, radius );
            }


			let newmarker = new google.maps.Marker( {
				position: myLatLng,
				label: String( mark )
			} );
			newmarker.addListener( 'click', () => {
				this.goToAlpha(element);
			} );
			markers[ index ] = newmarker;
            bounds.extend( newmarker.getPosition() );
        } );

		googleMap.fitBounds( bounds );

		let curZoom = googleMap.getZoom();
		if ( this.maxZoom && curZoom > this.maxZoom ) {
			googleMap.setZoom( this.maxZoom );
		}

        markerCluster = new MarkerClusterer(googleMap, markers, { imagePath: 'https://staging-alpha-online.s3.ca-central-1.amazonaws.com/static/find_a_course/m' });

    }

    /**
     * Uses a helper method to create the `faa-item` component to load a specific alpha.
     * @param {*} alphaData 
     */
    goToAlpha(alphaData) {
		const listView = document.querySelector('find-a-course').shadowRoot.querySelector('faa-list-view');
		const attributeData = createComponentAttribute('alpha', alphaData);
		loadComponent('faa-item', attributeData, listView);
		this.shadowRoot.querySelector('faa-action-bar').setAttribute('allowback', true);
    }

    /**
     * Instantiates the GoogleMaps service on the component and attaches a Callback.
     */
    registerGoogleMaps() {
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCDg-fW9cJEOCEPq7pmcugfKO8lT6Ow-CI&libraries=places,geometry&callback=initMap';
        script.defer = true;
        document.head.appendChild(script);
        window.initMap = () => { this.initGoogleMaps() }
    }

    /**
     * Renders the GoogleMap on the screen and initializes the `autocomplete` query
     * from Google Map.
     */
    initGoogleMaps() {
        googleMap = new google.maps.Map(this.shadow.getElementById('map'), {
            center: { 
						lat: getConfig()?.latitude
							 ? parseInt(getConfig().latitude, 10)
							 : -34.397, 
						lng: getConfig()?.longitude
							 ? parseInt(getConfig().longitude, 10)
							 : 150.644
			},
            zoom: getConfig()?.zoom ? parseInt(getConfig().zoom, 10) : 8
        });

        autocomplete = new google.maps.places.Autocomplete(
            this.shadowRoot.querySelector('faa-form').shadowRoot.getElementById('city-name'),
            {
                types: [ 'geocode' ]
            }
        );

        autocomplete.addListener('place_changed', this.onPlaceChanged.bind(this));
    }

    /**
     * It adds the markers on the map based on the query results.
     */
    onPlaceChanged() {
        let city = autocomplete.getPlace();
        let cityCoordinates = {
            lat: city.geometry.location.lat(),
            lng: city.geometry.location.lng()
        };
        const form = this.shadow.querySelector('faa-form');
        form.setAttribute('city', JSON.stringify(cityCoordinates));
    }

    render() {
        this.shadow.innerHTML = `
            <style>
				:host {
					--color-primary: #e42312;
					--color-secondary: #5d6368;
				}

				faa-load {
					position: absolute;
					top: 0;
					width: 100%;
					height: 100%;
				}
				
                * {
                    font-family: ITCAvantGardeStd;
					color: #5d6368;
                }

				button {
					font-size: medium
				}
    
                body {
                    padding: 0;
                    margin: 0;
                }

                #main {
                    display: flex;
                    position: relative;
                }
                
                #map {
                    flex: 1;
                    width: 100%;
                    height: auto;
                    height: 565px;
                    margin: 0 5px;
                }
                
                #right-side {
                    flex: 1;
                    height: 565px;
                    overflow: auto;
                    margin: 0 5px;
					overflow-x: hidden;
                }

				@media only screen and (max-width: 600px) {
					#main {
						display: block;
					}

					#map {
						margin: 0 0 10px 0;
					}

					#right-side {
						padding-left: 0
					}
				}
            </style>

            <div id="main">
                <div id="map" style="display: block"></div>
                <div id="right-side" style="position: ${isMobile() ? 'static' : 'relative'}">
                    <faa-action-bar style="display: none"></faa-action-bar>
                    <faa-form></faa-form>
                </div>
            </div>
        `;
        getTranslation();
        if (isMobile()) {
            hideShowMap();
			this.shadow.querySelector('#right-side').style.height = 'auto';
        }
    }

    /**
     * Centralizes a selected Alpha on the Map.
     */
    setSelectedAlphaOnMap() {
        googleMap.panTo( {lat: this.selectedalpha.lat, lng: this.selectedalpha.lng } );
		googleMap.setZoom(15)
    }
}

customElements.define('find-a-course', FindAlpha);
