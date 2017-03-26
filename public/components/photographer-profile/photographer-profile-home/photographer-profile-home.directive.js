app.directive('photographerProfileHome', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/photographer-profile/photographer-profile-home/photographer-profile-home.directive.html',
        controller: 'PhotographerProfileHomeController',
        controllerAs: 'vm'
    };
});