app.directive('vendorAccount', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/vendor-account/vendor-account.directive.html',
        controller: 'VendorAccountController',
        controllerAs: 'vm'
    };
});