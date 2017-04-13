app.controller("PhotographerProfileBookingController", ["PhotographerSearchFactory", "PhotographerBookingFactory",
    function (PhotographerSearchFactory, PhotographerBookingFactory) {
        var self = this;
        self.bookingDetails = PhotographerBookingFactory.bookingDetails;
        self.book = PhotographerBookingFactory.bookPhotographer
        PhotographerSearchFactory.updateSubvendorProfileDetails();
        self.currentSubvendor = PhotographerSearchFactory.currentSubvendor;
    }
]);
