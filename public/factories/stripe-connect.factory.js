app.factory("StripeConnectFactory", function ($http, $stateParams, $state) {

    var connectToStripeLink = { url: '' };

    function getConnectStripeAccountUrl() {
        $http({
            method: 'GET',
            url: '/stripeConnect/getConnectUrl',
            headers: {
                vendor_id: $stateParams.vendorId
            }
        }).then(function (response) {
            connectToStripeLink.url = response.data.stripeUrl;
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
            $state.transitionTo($state.current.name, $stateParams);
        }).catch(function (err) {
            console.log('error connecting stripe account to database', err);
        });
    }

    return {
        getConnectStripeAccountUrl: getConnectStripeAccountUrl,
        authorizeStripeAccount: authorizeStripeAccount,
        connectToStripeLink: connectToStripeLink
    };
});








