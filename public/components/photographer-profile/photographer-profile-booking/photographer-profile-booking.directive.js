app.directive('photographerProfileBooking', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/photographer-profile/photographer-profile-booking/photographer-profile-booking.directive.html',
        controller: 'PhotographerProfileBookingController',
        controllerAs: 'vm'
    };
});