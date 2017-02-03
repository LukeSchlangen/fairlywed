app.controller("SubvendorDetailsController", ["$http", "AuthFactory", "$stateParams",
    function ($http, AuthFactory, $stateParams) {
        var self = this;
        // self.packages = PackagesFactory.packages;
        // self.vendors = VendorAccountFactory.vendors;
        console.log('Vendor Details Controller has these $stateParams: ', $stateParams);

        self.params = $stateParams;
        self.packages = { list: [] };

        AuthFactory.$onAuthStateChanged(function (firebaseUser) {
            // firebaseUser will be null if not logged in
            console.log('AuthFactory check inside of VendorDetails Controller Triggered');
            if (firebaseUser) {
                // This is where we make our call to our server
                firebaseUser.getToken().then(function (idToken) {
                    $http({
                        method: 'GET',
                        url: '/subvendorDetailsData',
                        headers: {
                            id_token: idToken,
                            subvendor_id: $stateParams.subvendorId
                        }
                    }).then(function (response) {
                        console.log('subvendor details controller returned: ', response.data);
                        self.packages.list = response.data.packages;
                    }).catch(function (err) {
                        console.error('Error retreiving private user data: ', err);
                    });
                });
            } else {
                console.log('Not logged in or not authorized.');
            }
        });
    }
]);