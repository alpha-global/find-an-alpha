Polymer({
    is: 'individual-view',
    behaviors: [
        Polymer.NeonAnimatableBehavior
    ],
    properties: {
        sharedElements: {
            type: Object,
            value: function () {
                return {
                    'hero': this.$.main
                };
            }
        },
        animationConfig: {
            type: Object,
            value: function () {
                return {
                    'entry': [{
                        name: 'fade-in-animation',
                        node: this.$.backToList
                    }, {
                        name: 'hero-animation',
                        id: 'hero',
                        toPage: this
                    }],
                    'exit': [{
                        name: 'fade-out-animation',
                        node: this.$.backToList
                    }, {
                        name: 'scale-down-animation',
                        node: this.$.main,
                        transformOrigin: '50% 50%',
                        axis: 'y'
                    }]
                }
            }
        },
        date: {
            type: String,
            computed: '_formatDate(selected.start)'
        },
        time: {
            type: String,
            computed: '_formatTime(selected.start)'
        },
        day: {
            type: String,
            computed: '_formatDay(selected.start)'
        },
        units: {
            type: String,
            value: "km"
        },
        selected: {
            type: Object
        }
    },

    _onClearButtonClick: function () {
        this.fire('close');
    },

    backToSearch: function () {
        this.fire('backtosearch');
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

    _formatDay: function (raw) {
        var date = moment(raw).toDate();

        var weekdayNames = [
            "Sunday", "Monday", "Tuesday",
            "Wednesday", "Thursday", "Friday",
            "Saturday", "Sunday"
        ];

        var weekdayIndex = date.getDay();

        return weekdayNames[weekdayIndex];
    },

    _formatTime: function (raw) {
        var date = moment(raw).toDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return hours + ':' + minutes + ' ' + ampm;
    },

    _onICal: function () {
        var cal_single = ics();
        cal_single.addEvent('Alpha Canada', 'Attend an alpha.', this.selected.label, this.selected.start, this.selected.start);
        cal_single.download('alpha-event');

    }


});