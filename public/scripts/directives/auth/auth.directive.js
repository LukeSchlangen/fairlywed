app.directive('auth', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'scripts/directives/auth/auth.directive.html',
        controller: 'AuthController',
        controllerAs: 'vm'
    };
});