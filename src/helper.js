import './loading';
import './alert-component';
import { DateTime } from 'luxon';

// Google Maps Pins Imports for Webpack
import './images/m1.png';
import './images/m2.png';
import './images/m3.png';
import './images/m4.png';
import './images/m5.png';

/**
 * Removes spaces from strings
 * @param word<string> 
 */
export function removeSpaces(word) {
    return word.split(' ').join('-');
}

/**
 * Display loader.
 */
export function showLoader(elementToAppend) {
    const l = document.createElement('faa-load');
	elementToAppend
		? elementToAppend.appendChild(l)
		: document.querySelector('find-a-course').shadowRoot.querySelector('#right-side').append(l)
}

/**
 * Removes loader.
 */
export function dismissLoader(parentComponent) {
    let loaderEl = parentComponent
			? parentComponent.querySelector('faa-load')
			: document.querySelector('find-a-course').shadowRoot.querySelector('faa-load');
	parentComponent ? parentComponent.removeChild(loaderEl) : document.querySelector('find-a-course').shadowRoot.querySelector('#right-side').removeChild(loaderEl);
}

/**
 * Resets all the markers on the map.
 */
export function resetGoogleMapsMarks() {
    const main = document.querySelector('find-a-course');
    main.removeAttribute('alphamarkers');
    // document.querySelector('find-a-course').removeAttribute('alphamakers');
}

/**
 * Resets/Removes all attributes of a given element.
 * @param element 
 */
export function removeAllAttributes(element) {
    const elAttr = element.getAttributeNames();
    elAttr.forEach(attrEl => {
        element.removeAttribute(attrEl);
    });
}

/**
 * Loads a specific Alpha based on the `alpha` parameter.
 * It creates the `faa-item` webcomponent on the screen.
 * @param alpha 
 */
export function goToAlpha(alpha) {
    document.querySelector('find-a-course').shadowRoot.querySelector('faa-form').shadowRoot.querySelector('faa-list-view').shadowRoot.querySelector('#result-list').style.display = 'none';
    let itemView;
    if (document.querySelector('find-a-course').shadowRoot.querySelector('faa-form').shadowRoot.querySelector('faa-list-view').shadowRoot.querySelector('faa-item')) {
        itemView = document.querySelector('find-a-course').shadowRoot.querySelector('faa-form').shadowRoot.querySelector('faa-list-view').shadowRoot.querySelector('faa-item');
        itemView.setAttribute('alpha', JSON.stringify(alpha));
    } else {
        itemView = document.createElement('faa-item');
        itemView.setAttribute('alpha', JSON.stringify(alpha));
        document.querySelector('find-a-course').shadowRoot.querySelector('faa-form').shadowRoot.querySelector('faa-list-view').shadowRoot.appendChild(itemView);
    }
}

/**
 * Returns a Date on 'month day, year' format.
 * @param alphas 
 */
export function alphaWithFriendlyDateTime(alphas) {
    let modifiedAlphas = [];
    alphas.forEach(el => {
        let alpha = el;
        Object.assign(alpha, internationalizeDate(el.date));
        modifiedAlphas.push(alpha);
    })
    return modifiedAlphas;
}

/**
 * Returns a transformed internationalized date.
 * @param {*} date 
 */
function internationalizeDate(date) {
    const time = DateTime.fromISO(date, { locale: getConfig() ? getConfig().i18nLocale : 'en' }).toLocaleString(DateTime.TIME_SIMPLE);
    const dateString = DateTime.fromISO(date, { locale: getConfig() ? getConfig().i18nLocale : 'en' }).toFormat('DDDD');
    return { formattedDate: dateString, formattedTime: time };
}

/**
 * Returns a short version of a date time already internationalized.
 * @param {*} date Date ISO
 * @returns string 'Jan 13, 1985'
 */
export function shortDate(date) {
	const locale = document.querySelector('find-a-course').getAttribute('language');
	return DateTime.fromISO(date, { locale: locale }).toLocaleString(DateTime.DATE_MED);
}

export function noAlphasFound() {
    const noAlpha = document.createElement('div');
    noAlpha.innerHTML = `
        <style>
            #no-alpha {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        </style>
        <div id="no-alpha">
            <h1>No Alphas Found</h1>
        </div>
    `;
    document.querySelector('find-a-course').shadowRoot.querySelector('faa-form').shadowRoot.querySelector('faa-list-view').shadowRoot.appendChild(noAlpha);
}

/**
 * Appends a given element to the `right-side` div of the find a course component.
 * @param {*} element 
 */
export function addChildToRightSide(element) {
    const rightSide = document.body.querySelector('find-a-course').shadowRoot.querySelector('#right-side');
    rightSide.appendChild(element);
}

/**
 * This method creates any component based on the parameters.
 * First it will create a new HTML Element with the `componentName` param.
 * 
 * It checks if there is a `parentComponent` parsed, if so, this will 'remove' that
 * parent from the view by setting a `display: none` style. In case of it being mobile,
 * it will display the `mobileSearchBar`, since the Mobile and Desktop behaviours are different.
 * 
 * The method will then verify is there are attributes, if so, the attribute data gets destructed
 * for easier implementation. In this condition, there is also a verification to check if the `faa-item`
 * element is rendered on the page, if so, the *alpha* attribute will be refreshed, if not, the newly 
 * created component will get the data attributes.
 * 
 * Final step is to push this newly created/updated component to the view using the `addChildToRightSide`
 * 
 * @param {*} componentName string that will represent an HTML element.
 * @param {*} attributes JSON or Object data that will be parsed to the component as attribute.
 * @param {*} parentComponent HTML Component reference.
 */
export function loadComponent(componentName, attributes, parentComponent) {
	const component = document.createElement(componentName);
	
	if (parentComponent) {
		if (isMobile() && attributes.id === 'faa-list-view') {
			mobileSearchBar(parentComponent);
		} else if (isMobile() && parentComponent.tagName === 'FAA-LIST-VIEW') {
			// Adds the actionBar into the `item-view` to show the back button.
			parentComponent.style.display = 'none';
			actionBar('show');
		} else {
			parentComponent.style.display = 'none';
		}
	}

    if (attributes) {
        const { attrName, data } = attributes;
		// If itemComponent is means the component is already loaded. The data will just be refreshed.
		const itemComponent = document.querySelector('find-a-course').shadowRoot.querySelector('faa-item');
		if (itemComponent) {
			// removeAllAttributes(itemComponent);
			itemComponent.setAttribute(attrName ? attrName : 'alpha', typeof(data) !== 'string' ? JSON.stringify(data) : data);
		} else {
			component.setAttribute(attrName ? attrName : 'alpha', typeof(data) !== 'string' ? JSON.stringify(data) : data);
		}
		if (!isMobile()) {
			actionBar('show');
		}
    }

    addChildToRightSide(component);
}

/**
 * This function will keep the `city-name` input visible. It doesn't create or add a new component,
 * rather, it hides everything but the `city-name` input.
 */
export function mobileSearchBar(component, action) {
	const elements = component.shadowRoot.querySelector('form').querySelectorAll(['button', 'select', 'label']);
	elements.forEach(el => el.style.display = action ? 'block' : 'none')
}

export function actionBar(action) {
    const ab = document.querySelector('find-a-course').shadowRoot.querySelector('faa-action-bar');
    switch (action) {
        case 'remove':
            ab.style.display = 'none';
            break;
        case 'show':
            ab.style.display = 'flex';
            break;
    }
}

/**
 * Selects all the components that are created dynamically and removes from the DOM or
 * resets all the attributes.
 */
export function goHome() {
    const rightSide = document.querySelector('find-a-course').shadowRoot.getElementById('right-side');
    const listView = rightSide.querySelector('faa-list-view');
    const itemView = rightSide.querySelector('faa-item');
    actionBar('remove');
    const faa = document.querySelector('find-a-course');
	faa.removeAttribute('selectedalpha');

	const faaForm = faa.shadowRoot.querySelector('faa-form').style.display = 'block';


    rightSide.removeChild(listView);
    if (itemView) {
        rightSide.removeChild(itemView)
    }

    resetGoogleMapsMarks();
}

/**
 * Displays an alert message, it can be an alert or success based on
 * the `isError` param. This creates and appends the HTML element on the
 * UI. The component itself comes from the  `alert-component.ts` file.
 * @param {*} isError 
 * @param {*} errorMsg 
 */
export function showAlert(isError, msg) {
    const main = document.querySelector('find-a-course').shadowRoot.getElementById('main');
    const alertEl = document.createElement('faa-alert');
    alertEl.setAttribute('iserror', isError);
    alertEl.setAttribute('message', msg);
    main.appendChild(alertEl);
}

export function getTranslation() {
    const findAnAlphaComp = document.querySelector('find-a-course');
    // const langAttr = findAnAlphaComp.getAttributeNames('lang')
}

export function converToCamelCase(str) {
    return str.toLowerCase()
        .replace(/['"]/g, '')
        .replace(/\W+/g, ' ')
        .replace(/ (.)/g, function ($1) { return $1.toUpperCase(); })
        .replace(/ /g, '');
}

/**
 * Helper method to convert from Kilometers to Miles.
 * @param input <number>
 */
export function convertKmToMi(input) {
    return (input / 1.609).toFixed();
}

/**
 * Detects if the platform is mobile.
 */
export function isMobile() {
	let check = false;
	(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
	return check;
};

/**
 * Show Hide Map
 */
export function hideShowMap() {
	const mapRef = document.querySelector('find-a-course').shadowRoot.querySelector('#map').style;
	const rightSideRef = document.querySelector('find-a-course').shadowRoot.querySelector('#right-side').style;
	if (mapRef.display === 'block') {
		mapRef.display = 'none';
		rightSideRef.paddingLeft = 0;
	} else {
		mapRef.display = 'block'
		rightSideRef.paddingLeft = 10;
		setMobileMapSize(mapRef);
	}
}

function setMobileMapSize(mapEl) {
	mapEl.height = '250px'
}

/**
 * Returns the set of configuration parsed by the creation of the element.
 */
export function getConfig() {
	const findACourseElement = document.querySelector('find-a-course');
	const settings = {};

	if ( findACourseElement.hasAttributes() ) {
		findACourseElement.getAttributeNames().forEach(attrName => {
			settings[converToCamelCase(attrName)] = findACourseElement.getAttribute(attrName)
		});
		
		return settings;
	}
	
}

export function translationObject() {
	const config = getConfig();
	if (config?.i18n) {
		return JSON.parse(getConfig().i18n);
	}
}

export function getSingleConfig(confName) {
	if (getConfig()) {
		const configuration = getConfig()[confName];
		return configuration ? JSON.parse(configuration) : null;
	}
}

export function createComponentAttribute(attrName, attrData) {
	return {
			name: attrName,
			data: typeof(attrData) !== 'string'
				  ? JSON.stringify(attrData)
				  : attrData
			}
}

/**
 * Simple method to avoid more typing. Just returns the `find-a-course` HTML element.
 * @returns 
 */
export function getMainComponent() {
    return document.querySelector('find-a-course').shadowRoot;
}
