app.factory("PackagesFactory", ["$http", function ($http) {

    var self = this;

    self.packages = { list: [] };

    function updatePackagesList() {
        return $http({
            method: 'GET',
            url: '/packageData',
            params: { vendorType: 'photographer' }
        }).then(function (response) {
            self.packages.list = response.data.packages;
            console.log('Packages factory returned: ', response.data.packages);
            return response;
        }).catch(function (err) {
            console.error('Error retreiving photographer packages data: ', err);
        });
    }

    return {
        packages: self.packages,
        updateList: updatePackagesList
    };
}]);