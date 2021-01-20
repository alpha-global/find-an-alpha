### PLEASE NOTE ###

When running locally and not in Docker there is a bug where the local /.nvm/versions/node/v15.3.0/lib/node_modules/polymer-cli/bin/polymer.js needs to be removed if you have to rebuild the project. If this happens remove the aforementioned folder from /polymer-cli down or switch to a different node version which allows cache clean.

How to run locally:

```bash

bower install && npm i -g polymer-cli && npm install && npm run start
```

How to build prior to working with docker:

```bash

bower install && npm i -g polymer-cli && npm install 
```

How to run in a Docker container:

```bash
docker-compose up --build
```

Running in Docker is recommended. The project will come up on port 8081 on localhost using the polymer server framework. Feel free to add whatever DNS entries you require into your hostfile. For testing I used 'dev.faa' for example.
# find-an-alpha
Find an Alpha Geo Map

# Changelog

## v1.0.0
* First launch

## v1.0.1
* Patched map reset zoom, center
* Cleaned up code comments, implemented standard code formatting

## v1.1.0
* Added iframe widget js

## v1.2.0
* Added i18n support
* Removed momentjs dependency

## v1.3.0
* Google analytics
* Conditionally show address

## v1.3.1
* Add language to google api include to localize map

## v1.3.2
* Added contact event on email address click
* Added name,id label replacement for GA event

## v1.3.3
* Update individual result view to show repeating style date

## v1.3.4
 * Spread out duplicate lat/lngs

## v.1.3.5
 * Fix line height on buttons that break to 2 lines

## v.1.3.6
 * Only show distance if result is an establishment or user location

## v.1.4.0
 * Update templates and response handling for new Builder API updates

## v.1.4.1
 * Add default per_page of 150 to api requests

## v.1.4.2
 * Patch event tracking references to old api properties
 
## v.1.4.3
 * Add ability to query for 'product' on the query params

## v.1.4.4
 * Add additional information detail field

## v1.5.0
 * Add online alpha icon
 * contact form instead of mailto

## v1.5.1
 * Patch detail view state on back to search

## v1.5.2
 * Button label and contact form styling

## v1.5.3
 * Inline form instead of own view

## v1.5.4
 * Patch missing mailto ref in individual view

## v1.5.5
 * Add blog_id to contact request

## v1.5.6
 * Patch css when not displaying map to properly resize parent iframe

## v1.5.7
 * Remove contact email