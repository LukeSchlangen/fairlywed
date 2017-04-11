app.controller("PhotographerProfileAboutController", function ($stateParams, PhotographerSearchFactory) {
    var self = this;

    PhotographerSearchFactory.getSubvendorProfileDetails();

    self.params = $stateParams;
});