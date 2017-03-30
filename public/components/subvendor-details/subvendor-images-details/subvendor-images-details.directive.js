app.directive('subvendorImagesDetails', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/subvendor-details/subvendor-images-details/subvendor-images-details.directive.html',
        controller: 'SubvendorImagesDetailsController',
        controllerAs: 'vm'
    };
});