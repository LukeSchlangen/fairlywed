app.directive('photographerJoinFollowContactCards', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'components/photographer-join-follow-contact-cards/photographer-join-follow-contact-cards.directive.html',
        controller: 'PhotographerJoinFollowContactCardsController',
        controllerAs: 'vm'
    };
});