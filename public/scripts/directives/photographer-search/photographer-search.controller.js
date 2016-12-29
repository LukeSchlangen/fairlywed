app.controller("PhotographerSearchController", ["PhotographerFactory", "$scope", 
    function (PhotographerFactory, $scope) {
        var self = this;
        self.search = {package: "Two Photographers: 8 Hours"};
        self.packages = PhotographerFactory.packages;
        self.updatePhotographersList = function () {
            PhotographerFactory.updatePhotographersList(self.search);
        };
        self.initialize = function() {
            var input = document.getElementById('searchTextField');
            var autocomplete = new google.maps.places.Autocomplete(input);
            console.log("Initializing google maps");
            google.maps.event.addListener(autocomplete, 'place_changed', function () {
                var place = autocomplete.getPlace();
                self.search.latitude = place.geometry.location.lat();
                self.search.longitude = place.geometry.location.lng();
                self.updatePhotographersList();
            });
        }
    }
]);