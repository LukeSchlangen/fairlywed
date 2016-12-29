app.controller("PhotographerListController", ["PhotographerFactory",
    function (PhotographerFactory) {
        var self = this;

        self.photographers = PhotographerFactory.photographers;
    }
]);