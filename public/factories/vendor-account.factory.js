app.factory("VendorAccountFactory", function ($http, AuthFactory, $state, $stateParams) {

    var vendors = { list: [] };

    AuthFactory.$onAuthStateChanged(getVendorList);

    function getVendorList() {
        $http({
            method: 'GET',
            url: '/vendorAccountData'
        }).then(function (response) {
            console.log('Vendors factory returned: ', response.data.vendors);
            vendors.list = response.data.vendors;
            if (!$stateParams.vendorId && vendors.list.length > 0) {
                var newStateParams = angular.copy($stateParams);
                newStateParams.vendorId = vendors.list[0].id;
                $state.go('account.vendor.details', newStateParams);
            }
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
});