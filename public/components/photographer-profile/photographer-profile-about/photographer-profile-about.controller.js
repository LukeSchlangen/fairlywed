app.controller("PhotographerProfileAboutController", function (PhotographerSearchFactory, PublicImagesFactory) {
    var self = this;

    PhotographerSearchFactory.getSubvendorProfileDetails();
    self.images = PublicImagesFactory.images;
    self.currentSubvendor = PhotographerSearchFactory.currentSubvendor;
});