app.factory("PhotographerFactory", ["$http", "$stateParams", function ($http, $stateParams) {

    console.log('photographer factory logging $stateParams: ', $stateParams);

    var self = this;
    if (!self.search) { self.search = {}; };
    if (!self.search.parameters) { self.search.parameters = {}; }
    if (!self.search.parameters.package) { self.search.parameters.package = {}; }
    self.search.parameters.location = $stateParams.location;
    self.search.parameters.longitude = $stateParams.longitude;
    self.search.parameters.latitude = $stateParams.latitude;
    self.search.parameters.package.id = $stateParams.package;
    self.packages = { list: [] };
    self.photographers = { list: [] };
    updatePhotographersList();
    updatePackagesList();

    function updatePhotographersList() {
        self.search.parameters.vendorType = 'photographer'
        $http({
            method: 'GET',
            url: '/vendorData',
            params: { search: self.search.parameters }
        }).then(function (response) {
            console.log('Photographer factory received photographer data from the server: ', response.data);
            self.photographers.list = response.data.vendors;
        }).catch(function (err) {
            console.error('Error retreiving photographer data: ', err);
        });
    }

    function updatePackagesList() {
        $http({
            method: 'GET',
            url: '/packageData',
            params: { vendorType: 'photographer' }
        }).then(function (response) {
            console.log('Photographer factory received packages data from the server: ', response.data);
            var currentPackageArray = response.data.packages.filter(function( package ) {
                return package.id == $stateParams.package;
            });
            self.search.parameters.package = currentPackageArray[0];
            self.packages.list = response.data.packages;
        }).catch(function (err) {
            console.error('Error retreiving photographer packages data: ', err);
        });
    }

    return {
        packages: self.packages,
        photographers: self.photographers,
        updatePhotographersList: updatePhotographersList,
        search: self.search
    };
}]);