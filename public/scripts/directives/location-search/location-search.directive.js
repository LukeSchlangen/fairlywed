app.directive('locationSearch', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'scripts/directives/location-search/location-search.directive.html',
        controller: 'LocationSearchController',
        controllerAs: 'vm'
    };
});