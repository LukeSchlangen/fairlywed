app.factory("PhotographerMatchmakerFactory", ["PhotographerSearchFactory", "$http", function (PhotographerSearchFactory, $http) {

    var photos = { list: [] };
    function getPhotos() {
        var returnPhotos = photos.list.map(function (photoDetails) {
            photoDetails.liked = photoDetails.liked ? 1 : -1;
            return photoDetails;
        });

        $http({
            method: 'GET',
            url: '/matchmaker/',
            data: returnPhotos,

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