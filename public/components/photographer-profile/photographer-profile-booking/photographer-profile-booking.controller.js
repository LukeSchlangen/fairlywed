app.controller("PhotographerProfileBookingController", ["PhotographerSearchFactory",
    function (PhotographerSearchFactory) {
        var self = this;

        PhotographerSearchFactory.updateSubvendorProfileDetails();
    }
]);