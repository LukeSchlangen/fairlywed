app.directive('pageFooter', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/page-footer/page-footer.directive.html',
        controller: 'PageFooterController',
        controllerAs: 'vm'
    };
});