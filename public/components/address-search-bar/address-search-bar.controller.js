app.controller("AddressSearchBarController", function (PhotographerSearchFactory, PackagesFactory, $q, $scope) {
    var self = this;
    self.search = search;

    self.gmapsService = new google.maps.places.AutocompleteService();

    function search(address) {
        var deferred = $q.defer();
        getResults(address).then(
            function (predictions) {
                var results = [];
                if (predictions) {
                    for (var i = 0, prediction; prediction = predictions[i]; i++) {
                        results.push(prediction);
                    }
                }
                deferred.resolve(results);
            }
        );
        return deferred.promise;
    }

    function getResults(inputText) {
        var deferred = $q.defer();
        var address = inputText || ' ';
        self.gmapsService.getPlacePredictions({ input: address }, function (data) {
            deferred.resolve(data);
        });
        return deferred.promise;
    }

    self.updateCoordinates = function (selectedPlace) {
        if (selectedPlace) {
            console.log(selectedPlace);
            var googlePlacesService = new google.maps.places.PlacesService(document.createElement('div'));
            googlePlacesService.getDetails({
                reference: selectedPlace.reference
            }, function (details, status) {
                if (details) {
                    $scope.location = details.formatted_address;
                    $scope.latitude = details.geometry.location.lat();
                    $scope.longitude = details.geometry.location.lng();
                    $scope.$apply();
                    $scope.updateList();
                }
            });
        }
    }
});