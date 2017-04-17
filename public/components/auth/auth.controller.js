app.controller("AuthController", function (UserDataFactory) {
    var self = this;
    self.userData = UserDataFactory.userData;
    self.anonymousSignIn = UserDataFactory.anonymousSignIn;
    self.signIn = UserDataFactory.signIn;
    self.signOut = UserDataFactory.signOut;
});