/**
 * Created by cselvaraj on 4/29/14.
 */
angular.module('searchblox.trust',[]).filter('trust', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
})
/**
 * Source: http://stackoverflow.com/a/17315483/2706988
 */
.filter('htmlToPlaintext', [function() {
    return function(text) {
        return String(text).replace(/<[^>]+>/gm, '');
    }
}]);