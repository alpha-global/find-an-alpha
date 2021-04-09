# Find An Alpha JS
This is a **browser** VanillaJS web component that loads Google Map and upcoming Alphas from both Alpha and Marriage Builder.

It's composed of 7 webcomponents and 1 helper global file.
All the components has its own `shadow-dom`.

---

# Table of Contents
- [How does it work?](#How-it-works)
- [Installation](#Installation)
- [Web Components](#Web-components)
	- [index.js](###index.js)
	- [list-view.js](###list-view.js)
	- [item-view.js](###item-view.js)
	- [form.js](###form.js)
	- [action-bar.js](###action-bar.js)
	- [alert-component.js](###alert-component.js)
	- [loading.js](###loading.js)
---

# How it works
This webcomponent is dependant on these files:

**Alphas**

[find-an-alpha.php](https://github.com/alpha-global/alphabuilder/blob/master/wp-content/themes/alpha/templates/find-an-alpha.php) file on [**AlphaBuilder**](https://github.com/alpha-global/alphabuilder) project.


**Marriage Builder**

 [find-a-course.php](https://github.com/alpha-global/marriage-builder/blob/master/wp-content/themes/marriage-builder/templates/find-a-course.php) for [Marriage Builder](https://github.com/alpha-global/marriage-builder).

The PHP file instantiates this component and passes all the settings as attributes. Each 'country' or *'site'* has its own settings, for example, in Canada there are Alphas in English, French, Spanish... in Brazil, there are only in Portuguese and English. These languages options *(among others)* are passed to the component by these settings.

There is also a special `src` setting that's parsed on the Marriable Builder side that "tells" the component to hide the "age group" select from the ui.

```
The settings from each site comes from the Wordpress admin panel.
```


>*NOTE: The attribute data passed to this component will always be as string, the data types in the table below represents its types **after** being parsed.*

| Setting | Type |Description |
| --- | --- | --- |
| `api` | string | End-point to the host site *(where the request is coming from.)* |
| `api-key` | string |  **Still to figure out** |
| `places-options` | Object | Restricts the search query to a given country.  |
| `site-title` | string | The title of the current site *(host)* |
| `i18n` | Object | Object that contains **all translations** *(content*) for a given site. |
| `i18n-locale` | string | Country code ISO 639-1 |
| `has-calendar-download` | boolean | **Still to figure out** |
| `contact-api` | string | End-point URL to submit emails to Alpha Hosts. |
| `geocode-query` | undefined | **Still to figure out** |
| `ages` | array | Values that should be added on the `ages` selector in the form. |
| `languages` | array | Values that should be added on the `languages` selector in the form. |
| `radiuses` | array | Values that should be added on the `radius` selector in the form. |
| `dates` | array | Values that should be added on the `startingIn` selector in the form. |
| `latitude` | number | Default latitude for a given country. This is for the map initial render. |
| `longitude` | number | Default longitude for a given country. This is for the map initial render. |
| `max-zoom` | number | Max zoom for Map, the highest the number more it will show. |
| `zoom` | number | Default zoom for selected course. |

---

# Installation
Clone the repository, 'cd' into the directory and run `npm install`.

---

# Developing
Webpack will bundle the package; for development environment run `npm run start:dev`, this will allow debuging as well as the code on a human readable format.
Running `npm run build` will minify the entire bundle.

---

# Web Components
- [index.js](###index.js)
- [list-view.js](###list-view.js)
- [item-view.js](###item-view.js)
- [form.js](###form.js)
- [action-bar.js](###action-bar.js)
- [alert-component.js](###alert-component.js)
- [loading.js](###loading.js)

---


## index.js

Main entry way component `<find-a-course>` gets added to the HTML page and "holds" all the other components upon user's requests.
It's composed of 2 main html elements, the `map` and `right-side` divs.

The `map` component renders the Google Map and click interactions through `EventListeners` applied on each added marker.
The `right-side` is where subsequent components are loaded. When a new component is loaded on the view, the previous one doesn't get destroyed, it gets hidden using `display:none` css style. This way, navigation flows faster because there are no extra requests to query data from the server.

When this component is created, it received a set of configurations from the main PHP file that renders it. 

*(Table with all the settings above)*

**Dynamic Attribute Data**

This component takes full advantanges of HTMLElement lifecycle hooks:
- `connectedCallback()` is called after the constructor and it renders the page by calling the `render()` method as well as instantiates Google Maps by running the `registerGoogleMaps()` method.
- `observedAttributes()` observers for changes on 2 attributes, `alphamarkers` and `selectedalpha`.
- `attributeChangedCallback()` gets called everytime an attribute changes. In this case the component itself reacts for 2 attributes in particular, `alphamarkers` and `selectedalpha`. These values are added for map purposes. The method has 3 params, `prop` which is the attribute reference, `oldval` previous value of that prop, `newVal` new value of that prop.

  - `alphamakers`: list of all the found alphas to be added on the map *(markers)*.
  - `selectedalpha`: displays a unique marker *(alpha)* on the map and passes data from the map to the `item-view` component when the user clicks on the marker in the map.

**Methods and properties:**

- `onPlaceChanged()` method: Is called trhough an event listen on the Google Map `autocomplete` property. It takes the geo-location *(lat, lng)* and passes the data to the [`faa-form`](##form.js) component as `city` attribute. The `faa-form` component uses a method to catch these values and deals with all the changes.


---

## list-view.js

This component renders a list of found Alphas based on the user's criteria. The list of items to be created is passed to this component as an attribute string called `alpha`. 
This string is parse by the getter `get alphas()` which extracts the string attribute and returns a JSON object.

It uses the `anime.js` as dependency for animations. The main animation is set by the `animateWindow()` method.

Navigation between this and the `item-view` component is handled by the `displayItem()` method, that requires a param that represents the user's choosen alpha.

There some particular aspects for this component as far as mobile goes:

1. `renderMobile()` method: This applies **mobile specific** logic to the result list. The mobile version uses a different UI for the list then the desktop version. It will add the `.mobile-results` and `.mobile.results-list` css classes, displau the GoogleMap and calls the `setMobileListView()`;
2. `setMobileListView()` method: It does the "heavy-lifting" of the ui for mobile. It applies specific CSS styles to the **form.js** component to diplay just the *querybox* on the top of the page.
3. `createList()` method: It will apply a different styling for the list display.

>***Please Note:** when the `displayIntem()` method gets called, it **does not** destroy this component, rather, it hides it from the view keeping all the data available for the user at anytime. This component only gets destroyed and removed from the DOM when/if the user clicks on 'Edit Search' button.*

---

## item-view.js

This component renders the selected alpha information in the UI.

It uses the getter `get alpha()` to retrieve the `alpha` attribute provided by the parent component, either **index.js**, in case the user clicked on the marker on the map or **list-view.js**, in case the user clicked on the actual list item.

It also extends the `HTMLElement` class, taking advantage of its lifecycle hooks:

- `observedAttributes()`: It observers for changes on the `'alpha'` attribute *(The data for a selected alpha)*, if anything changes, the change will be caught by the `attributeChangedCallback
- `attributeChangedCallback()`: Gets called every time an observed attribute changes, in this case it will only react to changes for the *'alpha'* attribute. This method has 3 params, `prop` which is the attribute reference, `oldval` previous value of that prop, `newVal` new value of that prop. This method is important for cases where there is currently a selected alpha in the view and the user chooses another one from the map.

This component uses `anime.js` as dependency for animation.

Differently from the `item-list`, this component is destroyed everytime the user clicks on the "bacK" button.

### **Methods and Properties**

- **alpha**: Parsed as parameter to this component:
```
{
	"id":number,
   "date": ISOString,
   "title": string,
   "phone_number": string,
   "email_address": string,
   "additional_information": string,
   "lat": number,
   "lng": number,
   "formatted_address": string,
   "location":{
      "address": string,
      "city": string,
      "postal_code": string,
      "locality": string,
      "country": string
   },
   "language": string,
   "demographic": string,
   "setting" string:,
   "onlineDelivery": string,
   "delivery": string,
   "distance": number,
   "blog_id": number,
   "formattedDate": string,
   "formattedTime": string
}
```

- **signupToAttend(name, email):** Submits the information entered by the user on the UI. This method has a special condition that checks wether or not the `alpha` property has the `blog_id` property assigned to it. This is only assigned in case the request to the end-point comes from a Global site *(i.e: https://alphabuilderadmin.com...)*. From local requests, *i.e: https://**germany**.alphabuilderadmin.com...* the `blog_id` property is not presented.  This property is used by the contact end-point to find on which table the information for a given alpha is. Because we use multisites on WP, each coutry has its own ID.

---


## form.js

This is part of the initial component's creation. It's the component that holds the search form and it starts the navigation between components.

Once data is inputed in the form and a city/address has been added, the `performSearch()` method is triggered, as a result, it will either display an alert window, in case there are no alphas found or create the `list-view` component and parsing the results as `alphas` attributes.

It also extends the `HTMLElement` class, taking advantage of its lifecycle hooks:

- `connectedCallback()` method: Is called after the constructor and it renders the page by calling the `render()` method.
- `observedAttributes()` method: Observes for changes in the `city` attribute. This is the input from the 'Google Search Bar'. This value is set by the `find-a-course` component *(index.js)* file.
- `attributeChangedCallback()` method: Gets called every time an observed attribute changes, in this case it will only react to changes for the *'city'* attribute. This method has 3 params, `prop` which is the attribute reference, `oldval` previous value of that prop, `newVal` new value of that prop. This method is important for cases where there is currently a selected alpha in the view and the user chooses another one from the map.

**Methods and properties:**

- `selectedcity` variable: Its value comes from the `city` attribute that's passed to this component by the `find-a-course` component. The `attributeChangedCallback()` is responsible for reacting to any changes to it.

- `performSearch()` method: It will perform a search based on the form elements. It first checks if there is a value for the `userLocation` parameter. This parameter will only have a value if the user clicks on the 'Find My Location' button.
If no such parameter is provided, it will then use whatever value is on `selectedcity` variable plus all the other form elements and calls the api end point that will result in a Promise. If no errors, it checks if the user is using a mobile device, if so it will set `stateMinimized` to true and call the `mobileRender()` method. It also checks for the length of the results, if greater than 0, it calls the `showList()` component passing the `data` as parameter. In cases there are no results, it will display the alert window using the `alert-component.js`.

- `listenToFindLocationClick()` method: This method selects the *Find My Location* button and listens to clicks. If triggered, it calls the `getCurrentLocation()` method.

- `getCurrentLocation()` method: It uses HTML5 Geolocation API to determine the user's location. If the geolcation is provided by the browser will then call `performSearch()` method. In case no data or access is provided, it displays the alert message using the `alert-component.js`.

- `showList()` method: It takes a parameter `alphas` *(list of found alphas)* and uses the **Helper** `loadComponent()` method to create the `faa-list-view` component. Also checks if the `faa-list-view` component is already in the DOM, if so, it calls the helper `goHome()` method to reset all the views.

- `setMarkers()` method: It takes a parameter that represents the found alphas and passes those to the `find-a-course` as a `alphamarkers` attribute. The `find-a-course` element has a method to catch those changes and reflects it on the map.

- `createDropDowns()` method: Programatically creates the `select` element and items for *starting date, language, age group* and *radius*.

---
