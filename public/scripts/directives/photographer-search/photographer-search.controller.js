app.controller("PhotographerSearchController", ["PhotographerFactory",
    function (PhotographerFactory) {
        var self = this;

        self.updatePhotographersList = function() {
            PhotographerFactory.updatePhotographersList();
        };
    }
]);