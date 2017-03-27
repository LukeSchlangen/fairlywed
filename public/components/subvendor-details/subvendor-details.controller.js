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

        self.isSaturday = function (dayToCheck) {
            dayToCheck = new Date(dayToCheck);
            return dayToCheck.getDay() == 6;
        }

        self.toggleAvailability = function(availability) {
            if (availability.status == 'booked') {
                alert('This date has already been booked and cannot be made unavailable.')
            } else if (availability.status == 'available') {
                availability.status = 'unavailable';
            } else {
                availability.status = 'available';
            }
            SubvendorFactory.updateAvailability(availability);
        }
    }
]);