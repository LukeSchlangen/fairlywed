app.controller("PhotographerListController", ["PhotographerSearchFactory", "$stateParams",
    function (PhotographerSearchFactory, $stateParams) {
        var self = this;

        self.photographers = PhotographerSearchFactory.photographers;
        self.params = $stateParams;
    }
]);