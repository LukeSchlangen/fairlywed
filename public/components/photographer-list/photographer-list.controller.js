app.controller("PhotographerListController", ["PhotographerSearchFactory", "$stateParams",
    function (PhotographerSearchFactory, $stateParams) {
        var self = this;

        self.params = $stateParams;
        self.photographers = PhotographerSearchFactory.photographers;
    }
]);