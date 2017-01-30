app.directive('vendorAccount', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/vendor-form/vendor-form.directive.html',
        controller: 'VendorAccountController',
        controllerAs: 'vm'
    };
});