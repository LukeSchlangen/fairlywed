app.directive('photographerList', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'scripts/directives/photographer-list/photographer-list.directive.html',
        controller: 'PhotographerListController',
        controllerAs: 'vm'
    };
});