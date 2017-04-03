app.controller("AuthController", ["UserDataFactory",
    function (UserDataFactory) {
        var self = this;
        self.userData = UserDataFactory.userData;
        self.signIn = UserDataFactory.signIn;
        self.signOut = UserDataFactory.signOut;
    }
]);