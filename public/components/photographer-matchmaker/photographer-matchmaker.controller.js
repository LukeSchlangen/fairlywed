app.controller("PhotographerMatchmakerController", ["PhotographerSearchFactory", "PhotographerMatchmakerFactory", "AuthFactory",
    function (PhotographerSearchFactory, PhotographerMatchmakerFactory, AuthFactory) {
        var self = this;

        AuthFactory.$onAuthStateChanged(PhotographerMatchmakerFactory.getPhotos);

        self.photos = PhotographerMatchmakerFactory.photos;
        self.clickPhotos = function (photoId) {
            self.photos.list.forEach(function (photo) {
                photo.liked = photo.id === photoId;
            })
            PhotographerMatchmakerFactory.getPhotos();
        }
    }
]);
