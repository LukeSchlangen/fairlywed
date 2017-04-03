app.factory("VendorAccountFactory", ["$http", "AuthFactory", function ($http, AuthFactory) {

    var vendors = { list: [] };

    AuthFactory.$onAuthStateChanged(updateList);

    function updateList() {
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
            updateList();
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
        });
    }

    return {
        vendors: vendors,
        updateList: updateList,
        addVendor: addVendor
    };
}]);