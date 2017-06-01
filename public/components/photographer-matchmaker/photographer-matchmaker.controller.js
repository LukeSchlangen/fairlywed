app.controller("PhotographerMatchmakerController", ["PhotographerMatchmakerFactory",
    function (PhotographerMatchmakerFactory) {
        var self = this;

        self.photos = PhotographerMatchmakerFactory.photos;
        self.clickPhotos = function (photoId) {
            self.photos.list.forEach(function (photo) {
                photo.liked = photo.id === photoId;
            })
            PhotographerMatchmakerFactory.getPhotos();
        }
    }
]);
