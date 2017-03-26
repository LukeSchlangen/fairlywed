app.directive('photographerProfileAbout', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/photographer-profile/photographer-profile-about/photographer-profile-about.directive.html',
        controller: 'PhotographerProfileAboutController',
        controllerAs: 'vm'
    };
});