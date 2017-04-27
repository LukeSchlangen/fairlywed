app.directive('photographerMatchmaker', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/photographer-matchmaker/photographer-matchmaker.directive.html',
        controller: 'PhotographerMatchmakerController',
        controllerAs: 'vm'
    };
});