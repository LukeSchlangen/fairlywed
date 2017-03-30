app.directive('subvendorPackagesDetails', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/subvendor-details/subvendor-packages-details/subvendor-packages-details.directive.html',
        controller: 'SubvendorPackagesDetailsController',
        controllerAs: 'vm'
    };
});