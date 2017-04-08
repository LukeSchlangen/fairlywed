app.controller("PhotographerProfileGalleryController", function (PublicImagesFactory) {
    var self = this;

    self.images = PublicImagesFactory.images;
});