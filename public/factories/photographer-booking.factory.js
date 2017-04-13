app.factory("PhotographerBookingFactory", ["PhotographerSearchFactory", "$http", function (PhotographerSearchFactory, $http) {

    var bookingDetails = {};
    function bookPhotographer() {
        var search = PhotographerSearchFactory.search.parameters;
        var time = search.date;
        time.setHours(bookingDetails.time.getHours());
        time.setMinutes(bookingDetails.time.getMinutes());
        $http({
            method: 'POST',
            url: '/booking/',
            data: {
                phoneNumber: bookingDetails.phoneNumber,
                requests: bookingDetails.requests,
                time: time,
                location: {
                    latitude: search.latitude,
                    longitude: search.longitude,
                },
                packageId: search.package.id,
                subvendorId: search.subvendorId
            }
        }).then(function (response) {
            console.log('Photographer factory received photographer profile data from the server: ', response.data);
            // currentSubvendor.details = response.data;
        }).catch(function (err) {
            console.error('Error retreiving photographer profile data: ', err);
        })
    }
    return {
        bookPhotographer: bookPhotographer,
        bookingDetails: bookingDetails,
    };
}]);