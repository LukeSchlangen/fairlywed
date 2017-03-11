app.controller("SubvendorDetailsController", ["AuthFactory", "SubvendorFactory",
    function (AuthFactory, SubvendorFactory) {
        var self = this;

        self.packages = SubvendorFactory.subvendors;

        getAllPackages();

        function getAllPackages() {
            SubvendorFactory.updateList();
        }

        self.savePackage = function (packageToSave) {
            SubvendorFactory.updatePackage(packageToSave);
        }
    }
]);