app.directive('auth', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/auth/auth.directive.html',
        controller: 'AuthController',
        controllerAs: 'vm'
    };
});