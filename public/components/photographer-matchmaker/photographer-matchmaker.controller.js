app.controller("PhotographerMatchmakerController", ["PhotographerSearchFactory", "PhotographerMatchmakerFactory",
    function (PhotographerSearchFactory, PhotographerMatchmakerFactory) {
        var self = this;
        PhotographerMatchmakerFactory.getPhotos();
        self.photos = PhotographerMatchmakerFactory.photos;
        self.clickPhotos = function (photoId) {
            self.photos.list.forEach(function (photo) {
                photo.liked = photo.id === photoId;
            })
            PhotographerMatchmakerFactory.getPhotos();
        }
    }
]);
