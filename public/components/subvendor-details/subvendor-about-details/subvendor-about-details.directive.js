app.directive('subvendorAboutDetails', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/subvendor-details/subvendor-about-details/subvendor-about-details.directive.html',
        controller: 'SubvendorAboutDetailsController',
        controllerAs: 'vm'
    };
});