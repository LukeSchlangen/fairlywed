app.controller("PhotographerProfileBookingController", ["PhotographerSearchFactory",
    function (PhotographerSearchFactory) {
        var self = this;

        PhotographerSearchFactory.updateSubvendorProfileDetails();

        self.currentSubvendor = PhotographerSearchFactory.currentSubvendor;
    }
]);