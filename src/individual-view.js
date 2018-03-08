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
                        name: 'hero-animation',
                        id: 'hero',
                        toPage: this
                    }],
                    'exit': [{
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
        },
        siteTitle: {
            type: String,
            value: 'Alpha'
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
        var address = this.selected.address.address + ', ' + this.selected.address.city  + ', ' + this.selected.address.state  + ' ' + this.selected.address.postal;
        var end = new Date(this.selected.start);
        end.setHours(end.getHours() + 1);
        var endTime = end.toLocaleString();
        var description = window.location.href;
        cal_single.addEvent(this.selected.label, description,  address, this.selected.start, endTime);
        cal_single.download('alpha-event');

    }



});