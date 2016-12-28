app.directive('photographerSearch', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'scripts/directives/photographer-search/photographer-search.directive.html',
        controller: 'PhotographerSearchController',
        controllerAs: 'vm'
    };
});