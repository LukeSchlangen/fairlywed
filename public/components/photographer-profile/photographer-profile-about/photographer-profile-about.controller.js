app.controller("PhotographerProfileAboutController", function (PhotographerSearchFactory) {
    var self = this;

    PhotographerSearchFactory.getSubvendorProfileDetails();
    
    self.currentSubvendor = PhotographerSearchFactory.currentSubvendor;
});