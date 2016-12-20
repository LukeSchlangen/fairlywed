app.controller("AuthController", ["Auth",
    function (Auth) {
        var self = this;
        self.auth = Auth;

        // any time auth state changes, add the user data to scope
        self.auth.$onAuthStateChanged(function (firebaseUser) {
            self.firebaseUser = firebaseUser;
        });
    }
]);