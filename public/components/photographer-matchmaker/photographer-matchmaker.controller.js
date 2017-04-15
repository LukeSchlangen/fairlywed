app.controller("PhotographerMatchmakerController", ["PhotographerSearchFactory", "PhotographerMatchmakerFactory",
    function (PhotographerSearchFactory, PhotographerMatchmakerFactory) {
        var self = this;
        self.getPhotos = PhotographerMatchmakerFactory.getPhotos;
        self.photos = PhotographerMatchmakerFactory.photos;
    }
]);
