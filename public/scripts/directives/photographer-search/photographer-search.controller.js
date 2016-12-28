app.controller("PhotographerSearchController", ["PhotographerFactory",
    function (PhotographerFactory) {
        var self = this;
        self.search={};
        self.packages = PhotographerFactory.packages;
        self.updatePhotographersList = function() {
            PhotographerFactory.updatePhotographersList(self.search);
        };
    }
]);