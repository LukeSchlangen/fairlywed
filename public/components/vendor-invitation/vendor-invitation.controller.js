app.controller("VendorInvitationController", function (VendorInvitationFactory, UserDataFactory, AuthFactory) {
    var self = this;
    
    AuthFactory.$onAuthStateChanged(function(firebaseUser) {
        if (firebaseUser) {
            VendorInvitationFactory.acceptVendorInvitation();
        }
    })

    self.userData = UserDataFactory.userData;
    self.signIn = UserDataFactory.signIn;
});