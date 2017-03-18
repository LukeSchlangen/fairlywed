app.factory("SubvendorFactory", ["$http", "AuthFactory", "$stateParams", function ($http, AuthFactory, $stateParams) {

    var self = this;

    var subvendor = { packageList: [], details: {} };

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
                        url: '/subvendorDetailsData/packages',
                        headers: {
                            id_token: idToken,
                            subvendor_id: $stateParams.subvendorId
                        }
                    }).then(function (response) {
                        console.log('subvendor details factory returned: ', response.data);
                        subvendor.packageList = response.data.packages;
                    }).catch(function (err) {
                        console.error('Error retreiving private user data: ', err);
                        subvendor.packageList = [];
                    });

                    $http({
                        method: 'GET',
                        url: '/subvendorDetailsData',
                        headers: {
                            id_token: idToken,
                            subvendor_id: $stateParams.subvendorId
                        }
                    }).then(function (response) {
                        console.log('subvendors controller returned: ', response.data);
                        subvendor.details = response.data;
                    }).catch(function (err) {
                        console.error('Error retreiving private user data: ', err);
                        subvendor.details = {};
                    });
                });
            } else {
                console.log('Not logged in or not authorized.');
                subvendor.packageList = [];
                subvendor.details = {};
            }
        });
    }

    function updatePackage(packageToSave) {
        console.log(packageToSave);
        AuthFactory.$onAuthStateChanged(function (firebaseUser) {
            // firebaseUser will be null if not logged in
            console.log('AuthFactory check inside of VendorDetails Controller Triggered');
            if (firebaseUser) {
                // This is where we make our call to our server
                firebaseUser.getToken().then(function (idToken) {
                    $http({
                        method: 'POST',
                        url: '/subvendorDetailsData/upsertPackage',
                        headers: {
                            id_token: idToken,
                            subvendor_id: $stateParams.subvendorId
                        },
                        data: packageToSave
                    }).then(function (response) {
                        console.log('subvendor details controller returned: ', response.data);
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

    function updateDetails(subvendorToSave) {
        console.log(subvendorToSave);
        AuthFactory.$onAuthStateChanged(function (firebaseUser) {
            // firebaseUser will be null if not logged in
            console.log('AuthFactory check inside of VendorDetails Controller Triggered');
            if (firebaseUser) {
                // This is where we make our call to our server
                firebaseUser.getToken().then(function (idToken) {
                    $http({
                        method: 'PUT',
                        url: '/subvendorDetailsData',
                        headers: {
                            id_token: idToken,
                            subvendor_id: $stateParams.subvendorId
                        },
                        data: subvendorToSave
                    }).then(function (response) {
                        console.log('subvendor factory returned: ', response.data);
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
        subvendor: subvendor,
        updateDetails: updateDetails,
        updateList: updateList,
        updatePackage: updatePackage
    };
}]);