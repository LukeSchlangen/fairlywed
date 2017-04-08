app.controller("PhotographerProfileBookingController", ["PhotographerSearchFactory",
    function (PhotographerSearchFactory) {
        var self = this;

        PhotographerSearchFactory.getSubvendorProfileDetails();

        self.currentSubvendor = PhotographerSearchFactory.currentSubvendor;
    }
]);