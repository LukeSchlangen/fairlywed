app.controller("PhotographerListController", ["PhotographerSearchFactory",
    function (PhotographerSearchFactory) {
        var self = this;

        self.photographers = PhotographerSearchFactory.photographers;
    }
]);