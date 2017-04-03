app.factory("VendorDetailsFactory", ["$http", "AuthFactory", "$stateParams", function ($http, AuthFactory, $stateParams) {

    var vendor = { subvendorList: [], details: {} };

    AuthFactory.$onAuthStateChanged(updateList);

    function updateList() {
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

        $http({
            method: 'GET',
            url: '/vendorDetailsData',
            headers: {
                vendor_id: $stateParams.vendorId
            }
        }).then(function (response) {
            console.log('subvendors controller returned: ', response.data);
            vendor.details = response.data;
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
            updateList();
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
            updateList();
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
        });
    }

    return {
        vendor: vendor,
        updateList: updateList,
        updateDetails: updateDetails,
        addSubvendor: addSubvendor
    };
}]);