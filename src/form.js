const axios = require('axios').default;
import './list-view';
import './fonts.min.css';
import {
	getConfig,
	translationObject,
	resetGoogleMapsMarks,
	showLoader,
	isMobile,
	showAlert,
	dismissLoader,
	goHome,
	loadComponent,
	removeSpaces,
	getSingleConfig
} from './helper';

let selectedCity;
const endPoint = getConfig()?.api ? getConfig().api : 'https://alphabuilderadmin.com/wp-json/wp/v2/alpha';
let stateMinimized = false;

// Form Selector Default Constants
const STARTING_IN_DEFAULT_OPTIONS = [
	{ label: '1 Day', value: '1-day' },
	{ label: '1 Month', value: '1-month' },
	{ label: '3 Months', value: '3-months' },
	{ label: '6 Months', value: '6-months' },
	{ label: 'Any', value: 'any' },
];

const LANGUAGES_DEFAULT_OPTIONS = [
	{ label: 'Select One', value: '' },
	{ label: 'Arabic', value: 'ar' },
	{ label: 'Cantonese (Traditional)', value: 'zh_HK' },
	{ label: 'English (CA)', value: 'en_CA' },
	{ label: 'Farsi (subtitled)', value: 'fa' },
	{ label: 'French (CA)', value: 'fr_CA' },
	{ label: 'Japanese', value: 'ja' },
	{ label: 'Mandarin (Simplified)', value: 'zh_CN' },
	{ label: 'Russian', value: 'ru' },
	{ label: 'Spanish', value: 'es' },
	{ label: 'Spanish (LA & C)', value: 'es_419' },
];

const RADIUSES_DEFAULT_OPTIONS = [
	{ label: '10 km', value: 10 },
	{ label: '25 km', value: 25 },
	{ label: '50 km', value: 50, selected: true },
	{ label: '100 km', value: 100 },
	{ label: '200 km', value: 200 },
];

const AGES_DEFAULT_OPTIONS = [
	{ label: 'Youth (13-18)', value: 'youth' },
	{ label: 'Young Adults (19-30)', value: 'students' },
	{ label: 'Senior (65+)', value: 'senior' },
	{ label: 'Any', value: '' },
];



/**
 * Form component that allows users to query for Alphas.
 */
class FormComponent extends HTMLElement {

    constructor() {
        super();
        this.shadow = this.attachShadow( { mode: 'open'} );
    }

    /**
     * Gets the component attribute 'city'.
     * 
     * @returns string
     */
    get city() {
        return this.getAttribute('city');
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['city'];
    }

    /**
     * Observes gives attributes and reacts to changes.
     * @param {*} prop 
     * @param {*} oldVal 
     * @param {*} newVal Object
     */
    attributeChangedCallback(prop, oldVal, newVal) {
        if (prop === 'city') {
            selectedCity = JSON.parse(newVal);
            this.performSearch();
        }
    }

    render() {
        this.shadow.innerHTML = `
            <style>
				* {
					font-family: ITCAvantGardeStd;
				}

				select, option {
					font: -moz-pull-down-menu;
				}

                button {
                    border: none;
                }
                
                select{
                    margin-bottom: 15px;
                }
                
                    select:last-child {
                        margin-bottom: 0;
                    }
                
                #find-button {
                    width: 100%;
                    background-color: var(--color-primary);
                    color: #FFF;
                    height: 50px;
					font-size: medium
                }

				#form {
					padding: 0 15px;
				}
                
				label {
					margin: 0 0 10px 20px;
				}

                input, select {
					-webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    border: 1px solid #f1f1f1;
                    -webkit-box-sizing: border-box;
                    box-sizing: border-box;
                    -webkit-transition: all .3s ease-in-out;
                    transition: all .3s ease-in-out;
                    outline: 0;
                    color: var(--color-secondary);
                    display: block;
                    width: 100%;
                    height: 50px;
                    padding: 0 24px;
                    font-size: 16px;
                    line-height: 1.75;
                    background-image: none;
					margin-top: 10px;
                }

                #city-name {
                    margin-bottom: 15px;
                    margin-top: 18px;
                }

                .input-address {
                    position: relative;
                }

                .input-address i {
                    position: absolute;
                    right: 7px;
                    width: 30px;
                    top: 11px;
                    background: #FFF;
                    padding: 0 10px;
                    display: none;
                }

				.error-inline-block {
					color: var(--color-primary)
				}
            </style>
            <form id="form">
                <button type="button" id="find-button">${translationObject()?.findLocationButton ? translationObject().findLocationButton : 'Find My Location' }</button>
                <div class="input-address">
                    <i class="filter-icon" id="filter">
						<svg enable-background="new 0 0 26 26" fill="#e42312" id="Слой_1" version="1.1" viewBox="0 0 26 26" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
							<g>
								<path d="M1.75,7.75h6.6803589c0.3355713,1.2952271,1.5039063,2.2587891,2.9026489,2.2587891 S13.9000854,9.0452271,14.2356567,7.75H24.25C24.6640625,7.75,25,7.4140625,25,7s-0.3359375-0.75-0.75-0.75H14.2356567 c-0.3355713-1.2952271-1.5039063-2.2587891-2.9026489-2.2587891S8.7659302,4.9547729,8.4303589,6.25H1.75 C1.3359375,6.25,1,6.5859375,1,7S1.3359375,7.75,1.75,7.75z M11.3330078,5.4912109 c0.8320313,0,1.5087891,0.6767578,1.5087891,1.5087891s-0.6767578,1.5087891-1.5087891,1.5087891S9.8242188,7.8320313,9.8242188,7 S10.5009766,5.4912109,11.3330078,5.4912109z" fill="#e42312"/>
								<path d="M24.25,12.25h-1.6061401c-0.3355713-1.2952271-1.5039063-2.2587891-2.9026489-2.2587891 S17.1741333,10.9547729,16.838562,12.25H1.75C1.3359375,12.25,1,12.5859375,1,13s0.3359375,0.75,0.75,0.75h15.088562 c0.3355713,1.2952271,1.5039063,2.2587891,2.9026489,2.2587891s2.5670776-0.963562,2.9026489-2.2587891H24.25 c0.4140625,0,0.75-0.3359375,0.75-0.75S24.6640625,12.25,24.25,12.25z M19.7412109,14.5087891 c-0.8320313,0-1.5087891-0.6767578-1.5087891-1.5087891s0.6767578-1.5087891,1.5087891-1.5087891S21.25,12.1679688,21.25,13 S20.5732422,14.5087891,19.7412109,14.5087891z" fill="#e42312"/>
								<path d="M24.25,18.25H9.7181396c-0.3355103-1.2952271-1.5037842-2.2587891-2.9017334-2.2587891 c-1.3987427,0-2.5670776,0.963562-2.9026489,2.2587891H1.75C1.3359375,18.25,1,18.5859375,1,19s0.3359375,0.75,0.75,0.75h2.1637573 c0.3355713,1.2952271,1.5039063,2.2587891,2.9026489,2.2587891c1.3979492,0,2.5662231-0.963562,2.9017334-2.2587891H24.25 c0.4140625,0,0.75-0.3359375,0.75-0.75S24.6640625,18.25,24.25,18.25z M6.8164063,20.5087891 c-0.8320313,0-1.5087891-0.6767578-1.5087891-1.5087891s0.6767578-1.5087891,1.5087891-1.5087891 c0.8310547,0,1.5078125,0.6767578,1.5078125,1.5087891S7.6474609,20.5087891,6.8164063,20.5087891z" fill="#e42312"/>
							</g>
						</svg>
					</i>
					<input type="text" name="city-name" id="city-name" placeholder="${translationObject()?.findAddressPlaceholder ? translationObject().findAddressPlaceholder : 'Enter a city or address to search nearby'}"></input>
                </div>
            </form>
        `;
        this.createDropDowns();
        this.listenToFindLocationClick();
        this.listenToFormChanges();
		
    }

    /**
     * Listen for clicks in the 'Find My Location' button.
     */
    listenToFindLocationClick() {
        const findLocationBtn = this.shadow.getElementById('find-button');
        findLocationBtn.addEventListener('click', () => this.getCurrentLocation() )
    }

    /**
     * Performs a serach based on the given values on the form. 
     * Method is automatically executed after the user enters a city
     * on the form or a form value is changed.
     * @param {*} userLocation  Object { lat: numnber, lng: number }
	 * @todo Refactor the form elements and api endpoint.
     */
    performSearch(userLocation) {
        if (userLocation) {
            const { latitude, longitude } = userLocation.coords;
            selectedCity = { lat: latitude, lng: longitude };
            dismissLoader();
        }
        resetGoogleMapsMarks();
		const mapComponent = document.querySelector('find-a-course').shadowRoot.querySelector('#map');
        showLoader(mapComponent);
		this.removeInlineErrorBlock();
        let form = this.shadow.getElementById('form')
        let formData = form.elements;
        const ageGroup = getConfig()?.src === 'mb' ? null : formData.age.value.toLowerCase();
        const language = formData.language.value.toLowerCase();
        const radius = formData.radius.value.toLowerCase();
        const startDate = formData.startingin.value.toLowerCase();

        const apiEndPoint = `${endPoint}?latitude=${selectedCity.lat}&longitude=${selectedCity.lng}&per_page=150&starting-in=${startDate}&language=${language}&demographic=${ageGroup}&radius=${radius}`;

        const results = axios.get(apiEndPoint);
        results
            .then(
                res => {
					// If Mobile, the behavior for the action-bar is different.
					if (isMobile() && !stateMinimized) {
						stateMinimized = true;
						this.mobileRender()
					}
                    res.data.length
					? this.showList(res.data)
					: this.showInlineErrorBlock();
                }
            )
            .catch(
                (e) => {
                    showAlert(true, e)
                }
            )
            .finally(() => dismissLoader(mapComponent))
    }

    /**
     * Creates the `faa-list-view` component and displays the found alphas.
     * @param {*} alphaData <array>
     */
    showList(alphaData) {
		if ( document.querySelector('find-a-course').shadowRoot.querySelector('faa-list-view') ) {
			goHome(); // Resets all the views
		}
        loadComponent('faa-list-view', { attrName: 'alphas', data: JSON.stringify(alphaData), id:'faa-list-view' }, this);
        this.setMarkers(JSON.stringify(alphaData));
    }

    /**
     * Sets the `alphamarkers` attribute on the `find-a-course` component in
     * order to display markers on the map.
     * @param {*} alphaData <array>
     */
    setMarkers(alphaData) {
        const main = document.querySelector('find-a-course');
        main.removeAttribute('alphamarkers');
        main.setAttribute('alphamarkers', alphaData);
    }

    /**
     * Programatically creates the 'selects' for the form.
     */
    createDropDowns() {
        const labels = [
            {
                label: translationObject()?.findLabelStartingIn ? translationObject().findLabelStartingIn : 'Starting in',
				id: 'startingIn',
                options: getConfig()?.dates ? JSON.parse(getConfig().dates) : STARTING_IN_DEFAULT_OPTIONS
            },
            {
                label: translationObject()?.findLabelLanguage ? translationObject().findLabelLanguage : 'Language',
				id: 'language',
                options: getConfig()?.languages ? JSON.parse(getConfig().languages) : LANGUAGES_DEFAULT_OPTIONS
            },
            {
                label: translationObject()?.findLabelAge ? translationObject().findLabelAge : 'Age',
				id: 'age',
                options: getConfig()?.ages ? JSON.parse(getConfig().ages) : AGES_DEFAULT_OPTIONS
            },
            {
                label: translationObject()?.findLabelRadius ? translationObject().findLabelRadius : 'Radius',
				id: 'radius',
                options: this.appendDistanceUnitToRadiuses() ? this.appendDistanceUnitToRadiuses() : RADIUSES_DEFAULT_OPTIONS
            }
        ];

		// If the request is from Marriage Builder, removes the age selector.
		if (getConfig()?.src === 'mb') {
			const agesPropIndex = labels.map(item => item.id).indexOf('age');
			labels.splice(agesPropIndex, 1);
		}
    
        labels.forEach(el => {
            const label = document.createElement('label');
            label.innerText = el.label;
            this.shadow.getElementById('form').appendChild(label);
    
            const select = document.createElement('select');
            select.id = removeSpaces(el.id).toLowerCase();
            select.name = removeSpaces(el.id).toLowerCase();
            select.setAttribute('arial-label', el.label);
            
            el.options.forEach(optEl => {
                const option = document.createElement('option');
                option.value = optEl.value;
                option.innerText = optEl.label;
                option.selected = optEl.selected ? true : false;
                select.appendChild(option);
            });
            this.shadow.getElementById('form').appendChild(select);
        })
    }

	appendDistanceUnitToRadiuses() {
		const radiuses = getConfig()?.radiuses ? JSON.parse(getConfig()?.radiuses) : null;
		const distanceUnit = getSingleConfig('i18n')?.distanceUnit;
		if (radiuses && distanceUnit) {
			const radiusArray = [];
			radiuses.map(el => {
				el.label = `${el.label} ${distanceUnit}`;
				radiusArray.push(el);
			});
			return radiusArray;
		}
	}

    /**
     * Returns the current user location based on the HTML5 Geolocation API.
     * If the location is fetched it will then call `performSearch` method, else
     * it displays an error using the `Alert` class.
     */
    getCurrentLocation() {
        showLoader();
        if (navigator.geolocation) {
            navigator.geolocation
			.getCurrentPosition(
				(location) => {
					this.setAddressOnSearchBar(location);
					this.performSearch(location);
				},
				(e) => {
					dismissLoader();
					showAlert(true, translationObject()?.errorGeoLocation ? translationObject().errorGeoLocation : 'We need permission to access your location.')
				}
			);
        }
    }

    /** 
     * Listens to changes on the form and executes `performSearch` only if
     * there is a city on the 'city-name' field, else it doesn't do anything.
     */
    listenToFormChanges() {
        this.shadow.querySelector('#form').addEventListener('change', (event) => {
            const city = this.shadow.getElementById('city-name').value;
            if (city !== '' && event.target.id !== 'city-name') {
                this.performSearch()
            }
        })
    }

    mobileRender() {
        if (stateMinimized) {
            this.shadow.getElementById('filter').style.display = 'block';
        } else {
            this.shadow.getElementById('filter').style.display = 'none';
		}
    }

	showInlineErrorBlock() {
		const errorEl = document.createElement('p');
		errorEl.className = 'error-inline-block';
		errorEl.innerText = translationObject()?.errorNoResults ? translationObject().errorNoResults : 'Sorry, there are no Alphas with these parameters.';
		this.shadow.appendChild(errorEl);
	}

	removeInlineErrorBlock() {
		this.shadow.querySelector('.error-inline-block')?.remove();
	}

	/**
	 * Uses Google's geolocation to run a reverse geolocation query that returns the address
	 * of a given coordinate.
	 * @param userLocation 
	 */
	setAddressOnSearchBar(userLocation) {
		const { latitude, longitude } = userLocation.coords;
		const endPoint = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCDg-fW9cJEOCEPq7pmcugfKO8lT6Ow-CI`;
		const address = axios.get(endPoint);
		address
		.then( res => {
			const data = res.data;
			const cityName = this.getCityNameFromReverseGeolocation(data.results);
			this.shadowRoot.querySelector('#city-name').value = cityName;
		})
		.catch( e => {
			showAlert(true, e)
		})
	}

	/**
	 * Google's Reverse Geocode returns an array that will be different depending on the location.
	 * Each element of the array contains a specific type of data that determines the `formatted_address`
	 * property. This method only needs the City, Province/State, Country, therefore the type that contains
	 * such data is 'locality'.
	 * @param reverseGeolocationData { plus_code: object, results: [] }
	 * @returns 
	 */
	getCityNameFromReverseGeolocation(reverseGeolocationData) {
		const address = reverseGeolocationData.find(el => el.types.includes('locality'));
		return address.formatted_address;
	}
}

customElements.define('faa-form', FormComponent);
