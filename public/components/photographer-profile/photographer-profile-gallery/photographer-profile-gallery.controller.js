app.controller("PhotographerProfileGalleryController", function (PublicImagesFactory) {
    var self = this;
    PublicImagesFactory.updateImagesList();
    self.images = PublicImagesFactory.images;
});