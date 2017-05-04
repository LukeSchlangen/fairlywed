app.directive('accountCompletion', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/account-completion/account-completion.directive.html',
        controller: 'AccountCompletionController',
        controllerAs: 'vm'
    };
});