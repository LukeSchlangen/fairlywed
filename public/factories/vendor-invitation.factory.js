app.factory("VendorInvitationFactory", function ($http, $stateParams, $state) {

    var vendorInvitation = { details: {} };

    function createVendorInvitation() {
        $http({
            method: 'POST',
            url: '/vendorPermissionsInvitation/create',
            headers: {
                vendor_id: $stateParams.vendorId
            }
        }).then(function (response) {
            vendorInvitation.details = response.data;
        }).catch(function (err) {
            console.error('Error retreiving vendor permissions invitation: ', err);
            vendorInvitation.details = {};
        });
    }

    function acceptVendorInvitation() {
        $http({
            method: 'POST',
            url: '/vendorPermissionsInvitation/accept',
            headers: {
                vendor_id: $stateParams.vendorId,
                invitation_token: $stateParams.invitationToken
            }
        }).then(function (response) {
            vendorInvitation.details = response.data;
            $state.transitionTo('account.vendor.details', { vendorId: $stateParams.vendorId });
        }).catch(function (err) {
            console.error('Error retreiving vendor permissions invitation: ', err);
            vendorInvitation.details = {};
        });
    }

    return {
        vendorInvitation: vendorInvitation,
        createVendorInvitation: createVendorInvitation,
        acceptVendorInvitation: acceptVendorInvitation
    };
});