app.directive('vendorForm', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'scripts/directives/vendor-form/vendor-form.directive.html',
        controller: 'VendorFormController',
        controllerAs: 'vm'
    };
});