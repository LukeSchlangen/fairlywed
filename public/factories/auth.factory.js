app.factory("AuthFactory", ["$firebaseAuth",
    function ($firebaseAuth) {
        var auth = $firebaseAuth();
        return auth;
    }
]);