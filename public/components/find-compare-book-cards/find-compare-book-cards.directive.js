app.directive('findCompareBookCards', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/find-compare-book-cards/find-compare-book-cards.directive.html',
        controller: 'FindCompareBookCardsController',
        controllerAs: 'vm'
    };
});