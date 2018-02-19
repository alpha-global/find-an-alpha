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
            }
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
            // reflectToAttribute:true
        },
        islessthan: {
            type: Boolean,
            value: false,
            computed: '_countlessthan(data)'
        },
        animationConfig: {
            type: Object,
            value: function () {
                return {
                    'entry': [{
                        name: 'fade-in-animation',
                        node: this.$.backToSearch
                    }],
                    'exit': [{
                        name: 'fade-out-animation',
                        node: this.$.backToSearch
                    }, {
                        name: 'hero-animation',
                        id: 'hero',
                        fromPage: this
                    }]
                };
            }
        }
    },
    showEmptyGeoQuery: function (geoQuery, geoResult) {

        this.$.placesError.innerHTML = "<p>Sorry, we couldn't find any Alphas in: " + geoQuery + "</p>";

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


    backToSearch: function () {
        this.$.placesError.innerHTML = "";
        this.fire('backtosearch');
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

    _countlessthan: function (data) {
        if (this.count < 4) {
            return true;
        }
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