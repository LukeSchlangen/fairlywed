app.directive('photographerProfileGallery', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/photographer-profile/photographer-profile-gallery/photographer-profile-gallery.directive.html',
        controller: 'PhotographerProfileGalleryController',
        controllerAs: 'vm'
    };
});