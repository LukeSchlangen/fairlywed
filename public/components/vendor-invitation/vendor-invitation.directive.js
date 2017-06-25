app.directive('vendorInvitation', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/vendor-invitation/vendor-invitation.directive.html',
        controller: 'VendorInvitationController',
        controllerAs: 'vm'
    };
});