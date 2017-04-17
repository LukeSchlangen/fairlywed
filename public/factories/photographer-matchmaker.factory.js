app.factory("PhotographerMatchmakerFactory", ["PhotographerSearchFactory", "$http", function (PhotographerSearchFactory, $http) {

    var photos = { list: [] };
    function getPhotos() {
        var returnPhotos = photos.list.map(function (photo) {
            return {
                id: photo.id,
                liked: photo.liked
            }
        })
        $http({
            method: 'GET',
            url: '/matchmaker/',
            params: { photos: returnPhotos },

        }).then(function (response) {
            console.log('Photographer factory received photographer profile data from the server: ', response.data);
            photos.list = response.data;
            // currentSubvendor.details = response.data;
        }).catch(function (err) {
            console.error('Error retreiving matchmaker photos: ', err);
        })
    }
    return {
        photos: photos,
        getPhotos: getPhotos,
    };
}]);

//  response.data.map(function (photoDetails) {
//                 photoDetails.liked = -1;
//                 return photoDetails;
//             });