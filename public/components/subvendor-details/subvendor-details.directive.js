app.directive('subvendorDetails', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/subvendor-details/subvendor-details.directive.html',
        controller: 'SubvendorDetailsController',
        controllerAs: 'vm'
    };
});