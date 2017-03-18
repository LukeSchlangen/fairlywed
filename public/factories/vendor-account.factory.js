app.factory("VendorAccountFactory", ["$http", "AuthFactory", function ($http, AuthFactory) {

    var self = this;

    var vendors = { list: [] };

    AuthFactory.$onAuthStateChanged(updateList);

    function updateList() {
        var firebaseUser = AuthFactory.$getAuth();
        // firebaseUser will be null if not logged in
        if (firebaseUser) {
            // This is where we make our call to our server
            firebaseUser.getToken().then(function (idToken) {
                $http({
                    method: 'GET',
                    url: '/vendorAccountData',
                    headers: {
                        id_token: idToken
                    }
                }).then(function (response) {
                    console.log('Vendors factory returned: ', response.data.vendors);
                    vendors.list = response.data.vendors;
                }).catch(function (err) {
                    console.error('Error retreiving private user data: ', err);
                    vendors.list = [];
                });
            });
        } else {
            console.log('Not logged in or not authorized.');
            vendors.list = [];
        }
    }

    function addVendor(newVendor) {
        console.log(newVendor);
        var firebaseUser = AuthFactory.$getAuth();
        // firebaseUser will be null if not logged in
        console.log('AuthFactory check inside of VendorDetails Controller Triggered');
        if (firebaseUser) {
            // This is where we make our call to our server
            firebaseUser.getToken().then(function (idToken) {
                $http({
                    method: 'POST',
                    url: '/vendorAccountData',
                    headers: {
                        id_token: idToken
                    },
                    data: newVendor
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
    }

    return {
        vendors: vendors,
        updateList: updateList,
        addVendor: addVendor
    };
}]);