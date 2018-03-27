window.str_replace = function ( str, values ) {
    var matchstrs = [];
    for ( var find in values ) {
        matchstrs.push( find );
    }
    var pattern = '{{(' + matchstrs.join( '|' ) + ')}}';
    var regex = new RegExp( pattern, 'g' );

    return str.replace( regex, function ( match, field ) {
        return values[ field ] || match;
    } );
};
