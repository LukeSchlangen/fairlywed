app.factory("VendorAccountFactory", ["$http", "AuthFactory", "$state", function ($http, AuthFactory, $state) {

    var vendors = { list: [] };

    AuthFactory.$onAuthStateChanged(getVendorList);

    function getVendorList() {
        $http({
            method: 'GET',
            url: '/vendorAccountData'
        }).then(function (response) {
            console.log('Vendors factory returned: ', response.data.vendors);
            vendors.list = response.data.vendors;
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
            vendors.list = [];
        });
    }

    function addVendor(newVendor) {
        $http({
            method: 'POST',
            url: '/vendorAccountData',
            data: newVendor
        }).then(function (response) {
            console.log('vendor details factory returned: ', response.data);
            getVendorList();
            $state.transitionTo('account.vendor.details', { vendorId: response.data.newVendorId });
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
        });
    }

    return {
        vendors: vendors,
        getVendorList: getVendorList,
        addVendor: addVendor
    };
}]);