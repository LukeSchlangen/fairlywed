app.controller("SubvendorPackagesDetailsController", ["AuthFactory", "SubvendorFactory", 
    function (AuthFactory, SubvendorFactory) {
        var self = this;

        self.subvendor = SubvendorFactory.subvendor;

        SubvendorFactory.getPackagesList();

        self.savePackage = SubvendorFactory.updatePackage;
    }
]);