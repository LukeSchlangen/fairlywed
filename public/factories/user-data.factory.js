app.factory("UserDataFactory", ["AuthFactory", '$http', function (AuthFactory, $http) {
    var userData = {details: {}};
    var signIn = AuthFactory.$signInWithPopup;
    var signOut = AuthFactory.$signOut;
    AuthFactory.$onAuthStateChanged(function (firebaseUser) {
        $http({
            method: 'GET',
            url: '/userData'
        }).then(function (response) {
            userData.details = firebaseUser;
            console.log('User was logged in, and auth factory received data from the server: ', response.data);
        }).catch(function (err) {
            userData.details = firebaseUser;
            console.error('Error retreiving private user data: ', err);
        });
    });

    return {
        userData: userData,
        signOut: signOut,
        signIn: signIn
    }
}]);