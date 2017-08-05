app.factory("PackagesFactory", function ($http) {

    var packages = { list: [] };

    function getPackageList() {
        return $http({
            method: 'GET',
            url: '/packageData',
            params: { vendorType: 'photographer' }
        }).then(function (response) {
            packages.list = response.data.packages;
            return response;
        }).catch(function (err) {
            console.error('Error retreiving photographer packages data: ', err);
        });
    }

    return {
        packages: packages,
        getPackageList: getPackageList
    };
});