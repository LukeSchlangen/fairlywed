app.controller("SubvendorAboutDetailsController", ["SubvendorFactory",
    function (SubvendorFactory) {
        var self = this;

        self.subvendor = SubvendorFactory.subvendor;

        SubvendorFactory.getDetails();

        self.updateDetails = SubvendorFactory.updateDetails;
    }
]);