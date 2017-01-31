app.factory("VendorAccountFactory", ["$http", "AuthFactory", function ($http, AuthFactory) {

    var self = this;

    self.vendors = { list: [] };

    function updateVendorList() {
        AuthFactory.$onAuthStateChanged(function (firebaseUser) {
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
                        self.vendors.list = response.data.vendors;
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
        vendors: self.vendors,
        updateList: updateVendorList
    };
}]);