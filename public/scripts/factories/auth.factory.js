app.factory("Auth", ["$firebaseAuth", "$http",
    function ($firebaseAuth, $http) {
        auth = $firebaseAuth();

        auth.$onAuthStateChanged(function (firebaseUser) {
            // firebaseUser will be null if not logged in
            if (firebaseUser) {
                // This is where we make our call to our server
                firebaseUser.getToken().then(function (idToken) {
                    $http({
                        method: 'GET',
                        url: '/userData',
                        headers: {
                            id_token: idToken
                        }
                    }).then(function (response) {
                        console.log('User was logged in, and auth factory received data from the server: ', response.data);
                    }).catch(function(err){
                        console.error('Error retreiving private user data: ', err);
                    });
                });
            } else {
                console.log('Not logged in or not authorized.');
            }
        });

        return auth;
    }
]);