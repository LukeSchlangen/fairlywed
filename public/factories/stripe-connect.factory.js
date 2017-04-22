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

    return {
        connectStripeAccount: connectStripeAccount
    };
});








