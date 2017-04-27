app.controller("VendorAccountController", function (PackagesFactory, VendorAccountFactory, $stateParams, UserDataFactory, $scope) {
    var self = this;
    self.packages = PackagesFactory.packages;
    self.vendors = VendorAccountFactory.vendors;
    PackagesFactory.getPackageList();
    VendorAccountFactory.getVendorList();
    self.newVendor = {};
    self.showAddNewVendorForm = false;

    self.initialize = function () {
        var input = document.getElementById('vendorLocationTextField');
        var autocomplete = new google.maps.places.Autocomplete(input, {
            componentRestrictions: { 'country': 'us' }
        });
        console.log("Initializing google maps");
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            self.newVendor.latitude = place.geometry.location.lat();
            self.newVendor.longitude = place.geometry.location.lng();
            self.newVendor.location_address = place.formatted_address;
            $scope.$apply();
        });
    }

    self.updatePrice = function (packageObject) {
        console.log('Package price update: ', packageObject)
    };

    self.addVendor = function () {
        VendorAccountFactory.addVendor(self.newVendor);
        self.newVendor = {};
        self.showAddNewVendorForm = false;
    }

    self.isCurrentVendor = function (vendorIdToCheck) {
        return $stateParams.vendorId == vendorIdToCheck;
    }

    self.userData = UserDataFactory.userData;
});