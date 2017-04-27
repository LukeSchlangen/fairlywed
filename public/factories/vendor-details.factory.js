app.factory("VendorDetailsFactory", function ($http, AuthFactory, $stateParams, VendorAccountFactory, $state, StripeConnectFactory) {

    var vendor = { subvendorList: [], details: {} };

    AuthFactory.$onAuthStateChanged(getAll);
    AuthFactory.$onAuthStateChanged(stripeAuthorizationCheck);

    function stripeAuthorizationCheck() {
        if($stateParams.state && $stateParams.code && $stateParams.scope) {
            StripeConnectFactory.authorizeStripeAccount();
        }
    }

    function getAll() {
        getSubvendorList();
        getDetails();
    }

    function getSubvendorList() {
        $http({
            method: 'GET',
            url: '/vendorDetailsData/subvendorsList',
            headers: {
                vendor_id: $stateParams.vendorId
            }
        }).then(function (response) {
            console.log('subvendors controller returned: ', response.data);
            vendor.subvendorList = response.data.subvendors;
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
            vendor.subvendorList = [];
        });
    }

    function getDetails() {
        $http({
            method: 'GET',
            url: '/vendorDetailsData',
            headers: {
                vendor_id: $stateParams.vendorId
            }
        }).then(function (response) {
            console.log('subvendors controller returned: ', response.data);
            vendor.details = response.data;
            vendor.details.travel_distance = Math.round(vendor.details.travel_distance / 1609.34);
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
            vendor.details = {};
        });
    }

    function updateDetails(vendorToSave) {
        $http({
            method: 'PUT',
            url: '/vendorDetailsData',
            headers: {
                vendor_id: $stateParams.vendorId
            },
            data: vendorToSave
        }).then(function (response) {
            console.log('vendor details factory returned: ', response.data);
            getDetails();
            VendorAccountFactory.getVendorList();
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
        });
    }

    function addSubvendor(newSubvendor) {
        $http({
            method: 'POST',
            url: '/subvendorDetailsData',
            headers: {
                vendor_id: $stateParams.vendorId
            },
            data: newSubvendor
        }).then(function (response) {
            console.log('vendor details factory returned: ', response.data);
            getSubvendorList();
            $state.transitionTo('account.vendor.details.subvendor.details.about',
                { vendorId: response.data.vendorId, subvendorId: response.data.newSubvendorId });
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
        });
    }

    return {
        vendor: vendor,
        updateDetails: updateDetails,
        addSubvendor: addSubvendor,
        getDetails: getDetails,
        getSubvendorList: getSubvendorList,
        stripeAuthorizationCheck: stripeAuthorizationCheck
    };
});