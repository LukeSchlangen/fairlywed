app.controller("PhotographerProfileGalleryController", function (PublicImagesFactory, PhotographerSearchFactory, $stateParams) {
    var self = this;
    PhotographerSearchFactory.getSubvendorProfileDetails();
    PublicImagesFactory.updateImagesList();
    self.images = PublicImagesFactory.images;
    self.currentSubvendor = PhotographerSearchFactory.currentSubvendor;
});