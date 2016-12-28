app.factory("PhotographerFactory", ["$http", function ($http) {

    var self = this;
    self.packages = { list: [] };
    self.photographers = { list: [] };
    updatePhotographersList();
    updatePackagesList();

    function updatePhotographersList(searchObject) {
        if (!searchObject) { searchObject = {}; }
        searchObject.vendorType = 'photographer'
        $http({
            method: 'GET',
            url: '/photographerData',
            params: { search: searchObject }
        }).then(function (response) {
            console.log('Photographer factory received photographer data from the server: ', response.data);
            self.photographers.list = response.data.photographers;
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
            self.packages.list = response.data.packages.map(function(package){ return package.name });
        }).catch(function (err) {
            console.error('Error retreiving photographer packages data: ', err);
        });
    }

    return {
        packages: self.packages,
        photographers: self.photographers,
        updatePhotographersList: updatePhotographersList
    };
}]);