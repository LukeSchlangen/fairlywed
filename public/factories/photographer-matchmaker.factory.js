app.factory("PhotographerMatchmakerFactory", ["PhotographerSearchFactory", "$http", "AuthFactory", function (PhotographerSearchFactory, $http, AuthFactory) {
    var search = PhotographerSearchFactory.search;
    var photos = { list: [] };

    AuthFactory.$onAuthStateChanged(getPhotos);
    PhotographerSearchFactory.$onSearchParametersChanged(getPhotos);
    
    function getPhotos() {
        if (search.parameters.package && search.parameters.longitude && search.parameters.latitude) {
                search.parameters.vendorType = 'photographer';
            var returnPhotos = photos.list.map(function (photo) {
                return {
                    id: photo.id,
                    liked: photo.liked
                }
            })
            $http({
                method: 'GET',
                url: '/matchmaker/',
                params: { 
                    photos: returnPhotos,
                    search: search.parameters
                },
            }).then(function (response) {
                console.log('Photographer factory received photographer profile data from the server: ', response.data);
                photos.list = response.data.images || [];
                PhotographerSearchFactory.photographers.list = response.data.subvendor || [];
                // currentSubvendor.details = response.data;
            }).catch(function (err) {
                console.error('Error retreiving matchmaker photos: ', err);
            })
        }
    }
    return {
        photos: photos,
        getPhotos: getPhotos,
    };
}]);