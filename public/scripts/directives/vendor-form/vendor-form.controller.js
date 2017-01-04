app.controller("VendorFormController", ["PhotographerFactory", 
    function (PhotographerFactory) {
        var self = this;
        // self.search = PhotographerFactory.search;
        self.packages = PhotographerFactory.packages;
        // self.updatePhotographersList = PhotographerFactory.updatePhotographersList;
        // self.updatePhotographersList(); // adds the parameters back to url on return to view
        self.initialize = function() {
            var input = document.getElementById('searchTextField');
            var autocomplete = new google.maps.places.Autocomplete(input, {
            //   types: ['(cities)'],
              componentRestrictions: {'country': 'us'}
            });
            console.log("Initializing google maps");
            google.maps.event.addListener(autocomplete, 'place_changed', function () {
                var place = autocomplete.getPlace();
                // self.search.parameters.latitude = place.geometry.location.lat();
                // self.search.parameters.longitude = place.geometry.location.lng();
                // self.search.parameters.location = place.formatted_address;
                // self.updatePhotographersList();
            });
        }
    }
]);