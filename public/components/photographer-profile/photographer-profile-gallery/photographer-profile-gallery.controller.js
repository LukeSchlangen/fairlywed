app.controller("PhotographerProfileGalleryController", ["PublicImagesFactory",
    function (PublicImagesFactory) {
        var self = this;
        PublicImagesFactory.updateImagesList();
        self.images = PublicImagesFactory.images;
    }
]);