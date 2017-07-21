app.factory("PhotographerMatchmakerFactory", ["PhotographerSearchFactory", "$http", "AuthFactory", function (PhotographerSearchFactory, $http, AuthFactory) {
    var search = PhotographerSearchFactory.search;
    var photos = { list: [] };

    AuthFactory.$onAuthStateChanged(getPhotos);
    PhotographerSearchFactory.$onSearchParametersChanged(getPhotos);
    
    function getPhotos() {
        if (search.parameters.package && search.parameters.longitude && search.parameters.latitude) {
            search.parameters.vendorType = 'photographer';
            var searchObject = angular.copy(search.parameters);
            searchObject.date = pgFormatDate(searchObject.date);
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
                    search: searchObject
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

    function pgFormatDate(date) {
        // via https://stackoverflow.com/questions/44988104/remove-time-and-timezone-from-string-dates/44997832#44997832
        if (typeof date != "string") {
            date = date.toDateString();
        }

        if (date) {
            if (moment(date.substring(4, 15), 'MMM DD YYYY').isValid() && date.substring(4, 15).length === 11) {
                // this handles dates like: "Fri Jul 06 2017 22:10:08 GMT-0500 (CDT)"    
                return moment(date.substring(4, 15), 'MMM DD YYYY').format('YYYY-MM-DD');
            } else if (moment(date.substring(0, 10), "YYYY-MM-DD").isValid() && date.substring(0, 10).length === 10) {
                // this handles dates like: "2017-07-06T02:59:12.037Z" and "2017-07-06"
                return date.substring(0, 10);
            } else {
                throw 'Date not formatted correctly';
            }
        } else {
            throw 'Date must exists for availability to insert'
        }
    }


    return {
        photos: photos,
        getPhotos: getPhotos,
    };
}]);