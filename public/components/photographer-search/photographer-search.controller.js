app.controller("PhotographerSearchController", function (PhotographerSearchFactory, PackagesFactory, $scope) {
    var self = this;
    self.search = PhotographerSearchFactory.search;
    self.packages = PackagesFactory.packages;
    self.updatePhotographersList = PhotographerSearchFactory.updatePhotographersList;
    self.updatePhotographersList(); // adds the parameters back to url on return to view
    PackagesFactory.getPackageList();
});