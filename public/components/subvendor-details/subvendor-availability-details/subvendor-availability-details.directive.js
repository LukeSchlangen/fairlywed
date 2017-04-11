app.directive('subvendorAvailabilityDetails', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/subvendor-details/subvendor-availability-details/subvendor-availability-details.directive.html',
        controller: 'SubvendorAvailabilityDetailsController',
        controllerAs: 'vm'
    };
});