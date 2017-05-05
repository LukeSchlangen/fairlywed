app.controller("SubvendorAboutDetailsController", function (SubvendorFactory) {
    var self = this;

    self.subvendor = SubvendorFactory.subvendor;

    SubvendorFactory.getDetails();

    self.updateDetails = SubvendorFactory.updateDetails;

    self.subvendorHasNotChanged = function () {
        var areTheyEqual = angular.equals(self.subvendor.details, self.subvendor.savedDetails);
        return areTheyEqual;
    }
});