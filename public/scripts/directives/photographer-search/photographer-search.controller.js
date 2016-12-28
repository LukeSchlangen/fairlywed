app.controller("PhotographerSearchController", ["PhotographerFactory",
    function (PhotographerFactory) {
        var self = this;
        self.search={};
        self.updatePhotographersList = function() {
            PhotographerFactory.updatePhotographersList(self.search);
        };
    }
]);