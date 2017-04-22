app.factory("StripeConnectFactory", function ($http, $stateParams, $window) {
    function connectStripeAccount() {
        $http({
            method: 'GET',
            url: '/stripeConnect/getConnectUrl',
            headers: {
                vendor_id: $stateParams.vendorId
            }
        }).then(function (response) {
            console.log('Connecting Stripe Account');
            $window.open(response.data.stripeUrl, '_blank');
        }).catch(function (err) {
            console.log('error retreiving stripe url', err);
        });
    }

    function authorizeStripeAccount() {
        var requestBody = {
            vendor_id: $stateParams.vendorId,
            stripe_state: $stateParams.state,
            stripe_code: $stateParams.code
        };

        $stateParams.state = null;
        $stateParams.code = null;
        $stateParams.scope = null;
        $http({
            method: 'POST',
            url: '/stripeConnect/authorizeStripeAccount',
            data: requestBody
        }).then(function () {
            console.log('Vendor', $stateParams.vendorId, ' is now connected to stripe');
        }).catch(function (err) {
            console.log('error connecting stripe account to database', err);
        });
    }

    return {
        connectStripeAccount: connectStripeAccount,
        authorizeStripeAccount: authorizeStripeAccount
    };
});








