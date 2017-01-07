app.directive('vendorForm', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/vendor-form/vendor-form.directive.html',
        controller: 'VendorFormController',
        controllerAs: 'vm'
    };
});