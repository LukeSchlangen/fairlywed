app.directive('vendorDetails', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/vendor-details/vendor-details.directive.html',
        controller: 'VendorDetailsController',
        controllerAs: 'vm'
    };
});