app.directive('photographerList', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/photographer-list/photographer-list.directive.html',
        controller: 'PhotographerListController',
        controllerAs: 'vm'
    };
});