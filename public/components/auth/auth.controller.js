app.controller("AuthController", ["AuthFactory",
    function (AuthFactory) {
        var self = this;
        self.auth = AuthFactory;

        // any time auth state changes, add the user data to scope
        self.auth.$onAuthStateChanged(function (firebaseUser) {
            self.firebaseUser = firebaseUser;
        });
    }
]);