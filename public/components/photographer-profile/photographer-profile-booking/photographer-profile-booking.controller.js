app.controller("PhotographerProfileBookingController", ["PhotographerSearchFactory", "AuthFactory",
    function (PhotographerSearchFactory, AuthFactory) {
        var self = this;
        self.isLoggedIn = false;
        if (!AuthFactory.$getAuth()) {
            AuthFactory.$signInWithPopup('google').then(() => {
                self.isLoggedIn = true;
            });
        } else {
            self.isLoggedIn = true;
        }

        PhotographerSearchFactory.updateSubvendorProfileDetails();

        self.currentSubvendor = PhotographerSearchFactory.currentSubvendor;
    }

]);