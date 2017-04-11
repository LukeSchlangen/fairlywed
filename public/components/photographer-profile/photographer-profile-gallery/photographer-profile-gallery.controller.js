app.controller("PhotographerProfileGalleryController", function (PublicImagesFactory, PhotographerSearchFactory) {
    var self = this;
    PhotographerSearchFactory.getSubvendorProfileDetails();
    PublicImagesFactory.updateImagesList();
    self.images = PublicImagesFactory.images;
});