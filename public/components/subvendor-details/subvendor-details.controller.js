app.controller("SubvendorDetailsController", ["AuthFactory", "SubvendorFactory",
    function (AuthFactory, SubvendorFactory) {
        var self = this;

        self.subvendor = SubvendorFactory.subvendor;

        getAllPackages();

        function getAllPackages() {
            SubvendorFactory.updateList();
        }

        self.updateDetails = function(vendorDetailsToSave) {
            SubvendorFactory.updateDetails(vendorDetailsToSave);
        }

        self.savePackage = function (packageToSave) {
            SubvendorFactory.updatePackage(packageToSave);
        }
    }
]);