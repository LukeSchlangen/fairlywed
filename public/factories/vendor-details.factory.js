app.factory("VendorDetailsFactory", ["$http", "AuthFactory", "$stateParams", function ($http, AuthFactory, $stateParams) {

    var self = this;

    var vendor = { subvendorList: [], details: {} };

    AuthFactory.$onAuthStateChanged(updateList);

    function updateList() {
        AuthFactory.$onAuthStateChanged(function (firebaseUser) {
            // firebaseUser will be null if not logged in
            console.log('AuthFactory check inside of VendorDetails Controller Triggered');
            if (firebaseUser) {
                // This is where we make our call to our server
                firebaseUser.getToken().then(function (idToken) {
                    $http({
                        method: 'GET',
                        url: '/vendorDetailsData/subvendorsList',
                        headers: {
                            id_token: idToken,
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
                            id_token: idToken,
                            vendor_id: $stateParams.vendorId
                        }
                    }).then(function (response) {
                        console.log('subvendors controller returned: ', response.data);
                        vendor.details = response.data;
                    }).catch(function (err) {
                        console.error('Error retreiving private user data: ', err);
                        vendor.details = {};
                    });
                });
            } else {
                console.log('Not logged in or not authorized.');
                vendor.subvendorList = [];
                vendor.details = {};
            }
        });
    }

    function updateDetails(vendorToSave) {
        console.log(vendorToSave);
        AuthFactory.$onAuthStateChanged(function (firebaseUser) {
            // firebaseUser will be null if not logged in
            console.log('AuthFactory check inside of VendorDetails Controller Triggered');
            if (firebaseUser) {
                // This is where we make our call to our server
                firebaseUser.getToken().then(function (idToken) {
                    $http({
                        method: 'POST',
                        url: '/vendorDetailsData',
                        headers: {
                            id_token: idToken,
                            vendor_id: $stateParams.vendorId
                        },
                        data: vendorToSave
                    }).then(function (response) {
                        console.log('vendor details factory returned: ', response.data);
                        updateList();
                    }).catch(function (err) {
                        console.error('Error retreiving private user data: ', err);
                    });
                });
            } else {
                console.log('Not logged in or not authorized.');
            }
        });
    }

    return {
        vendor: vendor,
        updateList: updateList,
        updateDetails: updateDetails
    };
}]);