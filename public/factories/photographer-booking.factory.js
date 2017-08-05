app.factory("PhotographerBookingFactory", ["PhotographerSearchFactory", "$http", function (PhotographerSearchFactory, $http) {

    var bookingDetails = {};

    function bookPhotographer(token) {
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
                location: search.location,
                latitude: search.latitude,
                longitude: search.longitude,
                packageId: search.package,
                subvendorId: search.subvendorId,
                price: PhotographerSearchFactory.currentSubvendor.details.currentPackage.price,
                stripeToken: token
            }
        }).then(function (response) {
            alert('Hooray! Congratulations! You have booked your wedding photographer!');
        }).catch(function (err) {
            console.error('Error booking the photographer: ', err);
            alert('Oh no! It looks like this photographer is no longer available on that day or something else went wrong. Don\'t worry, we haven\'t charged your credit card.');
        })
    }
    return {
        bookPhotographer: bookPhotographer,
        bookingDetails: bookingDetails,
    };
}]);