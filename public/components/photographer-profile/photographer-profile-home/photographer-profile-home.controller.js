app.controller("PhotographerProfileHomeController", function ($state) {
    var self = this;

    self.isCurrentState = function(stateToCheck){ 
        return $state.is(stateToCheck);
    } 
});