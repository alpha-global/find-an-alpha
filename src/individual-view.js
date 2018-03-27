Polymer( {
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
                    'entry': [ {
                        name: 'hero-animation',
                        id: 'hero',
                        toPage: this
                    } ],
                    'exit': [ {
                        name: 'scale-down-animation',
                        node: this.$.main,
                        transformOrigin: '50% 50%',
                        axis: 'y'
                    } ]
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
        },
        i18n: {
            type: Object,
            value: function ( inputs ) {
                var defaults = {
                    findDetailType: 'Type',
                    findDetailLocation: 'Location',
                    findDetailEmail: 'Email',
                    findDetailPhone: 'Phone',
                    findMoreInfo: 'For more information about this Alpha, please contact the organizer below.',
                    findContactButton: 'Contact',
                    findICalButton: 'Download iCal'
                };
                for ( var id in defaults ) {
                    inputs.i18n[ id ] = inputs.i18n[ id ] || defaults[ id ];
                }
                return defaults;
            }
        },

    },

    _formatDate: function ( raw ) {

        if ( !raw ) {
            return '';
        }
        var time = Date.parse( raw );
        if ( isNaN( time ) ) {
            return '';
        }

        return dateFormat( new Date( time ), 'JJ MMMM Do, YYYY' );

    },

    _formatDay: function ( raw ) {
        if ( !raw ) {
            return '';
        }
        var time = Date.parse( raw );
        if ( isNaN( time ) ) {
            return '';
        }

        var date = new Date( time );

        var dow = dateFormat( date, 'JJ' );
        return dow;
    },

    _formatTime: function ( raw ) {
        if ( !raw ) {
            return '';
        }
        var time = Date.parse( raw );
        if ( isNaN( time ) ) {
            return '';
        }

        var date = new Date( time );

        var t = dateFormat( date, 'H i a' );
        return t;
    },

    _onICal: function () {
        var cal_single = ics();
        var end = new Date( this.selected.start );
        end.setHours( end.getHours() + 1 );
        var endTime = end.toLocaleString();
        var description = window.location.href.split( "?" )[ 0 ];
        cal_single.addEvent( this.selected.label, description, this.selected.location, this.selected.start, endTime );
        cal_single.download( 'alpha-event' );

    }



} );