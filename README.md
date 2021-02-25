# Find An Alpha JS
This is a **browser** VanillaJS web component that loads a Google Map and upcoming Alphas from both Alpha and Marriage Builder.

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
This webcomponent is dependant on the [find-an-alpha.php](https://github.com/alpha-global/alphabuilder/blob/master/wp-content/themes/alpha/templates/find-an-alpha.php) file on [**AlphaBuilder**](https://github.com/alpha-global/alphabuilder) project.

The PHP file instantiates this component and passes all the settings as attributes. Each 'country' or *'site'* has its own settings, for example, in Canada there are Alphas in English, French, Spanish... in Brazil, there are only in Portuguese and English. These languages options *(among others)* are passed to the component by these settings.

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

The `map` component renders the Google Maps and click interactions through `EventListeners` applied on each added marker.
The `right-side` is where subsequent components are loaded. When I new component is loaded on the view, the previous one doesn't get destroyed, it gets hidden using `display:none` css selector. This way navigation flows faster because there are no extra requests to query data from the server.

When this component is created, it received a set of configurations for the main PHP file that renders it. 
*(Table with all the settings above)*

**Dynamic Attribute Data**

This component takes full advantanges of HTMLElement lifecycle hooks:
- `connectedCallback()` is called after the constructor and it renders the page by calling the `render()` method as well as instantiates Google Maps by running the `registerGoogleMaps()` method.
- `observedAttributes()` observers for changes on 2 attributes, `alphamarkers` and `selectedalpha`.
- `attributeChangedCallback()` gets called everytime a attribute changes. In this case the component itself reacts for 2 attributes in particular, `alphamarkers` and `selectedalpha`. These values are added for map purposes. The method has 3 params, `prop` which is the attribute reference, `oldval` previous value of that prop, `newVal` new value of that prop.

  - `alphamakers`: list of all the found alphas to be added on the map *(markers)*.
  - `selectedalpha`: displays a unique marker *(alpha)* on the map and passes data from the map to the `item-view` component when the user clicks on the marker in the map.

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


---


## form.js

This is part of the initial component's creation. It's the component that holds the search form and it starts the navigation between components.

It also extends the `HTMLElement` class, taking advantage of its lifecycle hooks:

- `connectedCallback()` method: Is called after the constructor and it renders the page by calling the `render()` method.
- `observedAttributes()` method: Observes for changes in the `city` attribute.

















---

# Translations
This was designed to be browser web component, in order to get the translations up to date, there is a integrated Node service to be executed on its own.
All the files inside `nodeBacked` are NOT bundled by Webpack, as they are triggered by the deployment pipeline.

The translations are coming from the **Find an Alpha** project on *PO Editor*.
To execute and download the translations run `npm run extract-languages`;

The translation are fetched following this recipe:

1. Fetches all the available languages
2. Fetches all the translations for each language
3. Creates/Adds into the `translations.json` file as
```
{
    "lang_key": [
      {
         "term": "",        // Reference for the i18n
         "definition":"",   // Translation value
         "context":"",
         "term_plural":"",
         "reference":"",
         "comment":""
      }]
}
```

---
