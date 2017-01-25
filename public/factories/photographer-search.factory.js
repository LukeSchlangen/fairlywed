app.factory("PhotographerSearchFactory", ["PackagesFactory", "$http", "$stateParams", "$state", function (PackagesFactory, $http, $stateParams, $state) {

    console.log('photographer factory logging $stateParams: ', $stateParams);

    var self = this;

    // -- SETTING DEFAULT VALUES FOR SEARCH OR GETTING THEM FROM STATE PARAMETERS ROUTING -- //
    if (!self.search) { self.search = {}; };
    if (!self.search.parameters) { self.search.parameters = {}; }
    if (!self.search.parameters.package) { self.search.parameters.package = {}; }
    self.search.parameters.location = $stateParams.location || "Minneapolis, MN, USA";
    self.search.parameters.longitude = $stateParams.longitude || -93.26501080000003;
    self.search.parameters.latitude = $stateParams.latitude || 44.977753;
    self.search.parameters.package.id = $stateParams.package ? $stateParams.package : 2;
    self.search.parameters.date = $stateParams.date ? new Date($stateParams.date) : new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    self.packages = PackagesFactory.packages;
    self.photographers = { list: [] };
    // ------------------------------------------------------------------------------------ //

    updatePhotographersList(); // Loading photographers list for the first time
    updatePackagesList(); // Loading packages list for the first time

    // -- RETURNING LIST OF PHOTOGRAPHERS BASED ON SEARCH PARAMETERS -- //
    function updatePhotographersList() {
        if (self.search.parameters.package.id && self.search.parameters.longitude && self.search.parameters.latitude) {
            self.search.parameters.vendorType = 'photographer';
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
        } else {
            console.log("All photographer searches must have a package id, longitude, and latitude");
        }

        // update route parameters based on search
        var newStateParameters = angular.copy(self.search.parameters);
        newStateParameters.package = self.search.parameters.package.id;
        newStateParameters.date = self.search.parameters.date.toDateString();
        console.log('newStateParameters:', newStateParameters)
        $state.transitionTo('home.photographers', newStateParameters);
    }
    // --------------------------------------------------------------- //

    function updatePackagesList() {
        if (self.search.parameters.package.id) {
            PackagesFactory.updateList().then(function (response) {
                var currentPackageArray = response.data.packages.filter(function (photoPackage) {
                    return photoPackage.id == $stateParams.package;
                });
                self.search.parameters.package = currentPackageArray[0];
            }); // Loading packages list for the first time
        } else {
            console.log("All package searches must have a package id");
        }
    }

    return {
        packages: self.packages,
        photographers: self.photographers,
        updatePhotographersList: updatePhotographersList,
        search: self.search
    };
}]);