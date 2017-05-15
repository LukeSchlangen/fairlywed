app.controller("SubvendorDetailsController", function ($state, SubvendorFactory) {
    var self = this;

    self.subvendor = SubvendorFactory.subvendor;

    self.isCurrentState = function (stateToCheck) {
        return $state.is(stateToCheck);
    }
});