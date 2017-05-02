app.directive('addressSearchBar', function () {
    return {
        restrict: 'E',
        scope: {
            location: '=',
            longitude: '=',
            latitude: '=',
            updateList: '&'
        },
        templateUrl: 'components/address-search-bar/address-search-bar.directive.html',
        controller: 'AddressSearchBarController',
        controllerAs: 'vm'
    };
});