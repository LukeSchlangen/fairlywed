app.factory("AuthFactory", function ($firebaseAuth) {
    var auth = $firebaseAuth();
    return auth;
});