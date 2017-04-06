app.controller("PhotographerProfileGalleryController", ["PublicImagesFactory",
    function (PublicImagesFactory) {
        var self = this;

        self.images = PublicImagesFactory.images;
    }
]);