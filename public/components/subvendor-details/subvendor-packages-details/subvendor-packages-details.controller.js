app.controller("SubvendorPackagesDetailsController", function (AuthFactory, SubvendorFactory) {
    var self = this;

    self.subvendor = SubvendorFactory.subvendor;

    SubvendorFactory.getPackagesList();

    self.savePackage = SubvendorFactory.updatePackage;
});