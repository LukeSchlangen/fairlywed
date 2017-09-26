app.directive('brideLoading', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/bride-loading/bride-loading.directive.html',
        controller: 'BrideLoadingController',
        controllerAs: 'vm'
    };
});