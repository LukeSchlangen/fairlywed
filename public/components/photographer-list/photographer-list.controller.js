app.controller("PhotographerListController", function (PhotographerSearchFactory, $stateParams) {
    var self = this;

    self.params = $stateParams;
    self.photographers = PhotographerSearchFactory.photographers;
});