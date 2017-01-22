app.directive('photographerSearch', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/photographer-search/photographer-search.directive.html',
        controller: 'PhotographerSearchController',
        controllerAs: 'vm'
    };
});