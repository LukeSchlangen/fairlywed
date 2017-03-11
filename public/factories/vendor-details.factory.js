app.factory("VendorDetailsFactory", ["$http", "AuthFactory", "$stateParams", function ($http, AuthFactory, $stateParams) {

    var self = this;

    var subvendors = { list: [] };

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
                        url: '/vendorDetailsData',
                        headers: {
                            id_token: idToken,
                            vendor_id: $stateParams.vendorId
                        }
                    }).then(function (response) {
                        console.log('subvendors controller returned: ', response.data);
                        subvendors.list = response.data.subvendors;
                    }).catch(function (err) {
                        console.error('Error retreiving private user data: ', err);
                        subvendors.list = [];
                    });
                });
            } else {
                console.log('Not logged in or not authorized.');
                subvendors.list = [];
            }
        });
    }

    // function updatePackage(packageToSave) {
    //     console.log(packageToSave);
    //     AuthFactory.$onAuthStateChanged(function (firebaseUser) {
    //         // firebaseUser will be null if not logged in
    //         console.log('AuthFactory check inside of VendorDetails Controller Triggered');
    //         if (firebaseUser) {
    //             // This is where we make our call to our server
    //             firebaseUser.getToken().then(function (idToken) {
    //                 $http({
    //                     method: 'POST',
    //                     url: '/subvendorDetailsData',
    //                     headers: {
    //                         id_token: idToken,
    //                         subvendor_id: $stateParams.subvendorId
    //                     },
    //                     data: packageToSave
    //                 }).then(function (response) {
    //                     console.log('subvendor details controller returned: ', response.data);
    //                     updateList();
    //                 }).catch(function (err) {
    //                     console.error('Error retreiving private user data: ', err);
    //                 });
    //             });
    //         } else {
    //             console.log('Not logged in or not authorized.');
    //         }
    //     });
    // }

    return {
        subvendors: subvendors,
        updateList: updateList,
        stateParams: $stateParams
    };
}]);