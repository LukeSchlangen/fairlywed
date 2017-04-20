app.factory("UserDataFactory", function (AuthFactory, $http) {
    var userData = { details: {}, isSignedIn: false };
    var anonymousSignIn = function () {
        AuthFactory.$signInAnonymously().then(function (firebaseUser) {
            userData.details = firebaseUser;
            userData.anonymousDetails = firebaseUser; // separate so when they log in this doesn't get blown away
        }).catch(function (error) {
            console.log(error);
            userData.details = null;
        });
    };
    var signIn = AuthFactory.$signInWithPopup;
    var signOut = AuthFactory.$signOut;
    AuthFactory.$onAuthStateChanged(function (firebaseUser) {
        userData.isSignedIn = firebaseUser && !firebaseUser.isAnonymous;
        userData.details = firebaseUser;
        if (firebaseUser) {
            var requestConfigObject = {
                method: 'GET',
                url: '/userData'
            };
            if (userData.anonymousDetails) {
                userData.anonymousDetails.getToken().then(function (previousAnonymousUserIdToken) {
                    requestConfigObject.headers = {
                        previously_anonymous_id_token: previousAnonymousUserIdToken
                    };
                    getUserData(requestConfigObject);
                });
            } else {
                getUserData(requestConfigObject);
            }
        } else {
            userData.isSignedIn = false;
            console.log('Anonymous Sign in triggered');
            anonymousSignIn();
        }
    });

    function getUserData(requestConfigObject) {
        $http(requestConfigObject).then(function (response) {
            userData.anonymousDetails = null;
            console.log('User was logged in, and auth factory received data from the server: ', response.data);
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
        });
    }

    return {
        userData: userData,
        anonymousSignIn: anonymousSignIn,
        signOut: signOut,
        signIn: signIn
    }
});