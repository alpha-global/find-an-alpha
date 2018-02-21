Polymer({
    is: 'list-view',
    behaviors: [
        Polymer.NeonAnimatableBehavior
    ],
    listeners: {
        'dom-change': '_onDomChanged'
    },
    properties: {
        data: {
            type: Array,
            value: function () {
                return [];
            },
            observer: '_dataChanged'
        },
        count: {
            type: Number,
        },
        units: {
            type: String,
            value: "km"
        },
        selected: {
            type: Object,
            notify: true,
        },
        animationConfig: {
            type: Object,
            value: function () {
                return {
                    'exit': [{
                        name: 'hero-animation',
                        id: 'hero',
                        fromPage: this
                    }]
                };
            }
        }
    },
    showEmptyGeoQuery: function (geoQuery, geoResult) {

        this.$.alerts.innerHTML = "Sorry, we couldn't find any Alphas in: " + geoQuery;
        this.$.alerts.hidden = false;

    },
    _dataChanged: function (newItems, oldItems) {
        this.$.alerts.innerHTML = '';
        if (newItems && newItems.length > 0 && newItems.length < 4) {
            this.$.alerts.innerHTML = 'Only ' + newItems.length + ' result(s) were found with your search criteria.<br />Try broadening your search radius to find more Alphas.';
            this.$.alerts.hidden = false;
        } else {
            this.$.alerts.hidden = true;
        }
    },

    _selectItem: function (event) {
        var target = event.target;
        while (!target.hasAttribute('index')) {
            target = target.parentNode;
        }
        this.selectedIndex = target.getAttribute('index');
        var location = target.parentNode.childNodes;
        for (var i = 0; i < location.length; i++) {
            //location.forEach(function (element) {
            var element = location[i];
            element.className = "single animated style-scope list-view";
        }
        var target = event.target;
        while (!target.hasAttribute('index')) {
            target = target.parentNode;
        }
        var item = this.$.locationList.itemForElement(target);
        this.$.selector.select(item);
        while (target !== this && !target._templateInstance) {
            target = target.parentNode;
        }
        // configure the page animation
        this.sharedElements = {
            'hero': target,
        };
        this.fire('item-click', {
            item: target,
            index: this.selectedIndex
        });

    },

    _animating: function () {
        var location = Polymer.dom(this.root).querySelectorAll("#location");
        for (var i = 0; i < location.length; i++) {
            //location.forEach(function (element) {
            var element = location[i];
            element.className = "single animating style-scope list-view";
        }
    },

    _onDomChanged: function () {
        this._animating();
        this.fire('domchanged');
    },

    _formatDate: function (raw) {
        var date = moment(raw).toDate();

        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];

        var weekdayNames = [
            "Sunday", "Monday", "Tuesday",
            "Wednesday", "Thursday", "Friday",
            "Saturday", "Sunday"
        ];

        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
        var weekdayIndex = date.getDay();

        return weekdayNames[weekdayIndex] + ", " + monthNames[monthIndex] + ' ' + day + ', ' + year;
    },


});