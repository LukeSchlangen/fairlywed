app.controller("PhotographerProfileBookingController", ["PhotographerSearchFactory", "PhotographerBookingFactory",
    function (PhotographerSearchFactory, PhotographerBookingFactory) {
        var self = this;
        self.bookingDetails = PhotographerBookingFactory.bookingDetails;
        self.book = PhotographerBookingFactory.bookPhotographer
        self.currentSubvendor = PhotographerSearchFactory.currentSubvendor;
    }
]);
