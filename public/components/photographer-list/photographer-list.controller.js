app.controller("PhotographerListController", ["PhotographerSearchFactory", "$stateParams",
    function (PhotographerSearchFactory, $stateParams) {
        var self = this;

        self.params = $stateParams;
    }
]);