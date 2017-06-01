app.directive('photographerVendorRegisterBookShootCards', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/photographer-vendor-register-book-shoot-cards/photographer-vendor-register-book-shoot-cards.directive.html',
        controller: 'PhotographerVendorRegisterBookShootCardsController',
        controllerAs: 'vm'
    };
});