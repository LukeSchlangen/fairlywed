app.controller("VendorAccountController", function (PackagesFactory, VendorAccountFactory, $stateParams, UserDataFactory) {
    var self = this;
    self.packages = PackagesFactory.packages;
    self.vendors = VendorAccountFactory.vendors;
    PackagesFactory.getPackageList();
    VendorAccountFactory.getVendorList();
    self.initialize = function () {
        var input = document.getElementById('searchTextField');
        var autocomplete = new google.maps.places.Autocomplete(input, {
            componentRestrictions: { 'country': 'us' }
        });
        console.log("Initializing google maps");
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
        });
    };

    self.addVendor = function () {
        VendorAccountFactory.addVendor(self.newVendor);
        self.newVendor = {};
    }

    self.isCurrentVendor = function(vendorIdToCheck) {
        return $stateParams.vendorId == vendorIdToCheck;
    }

    self.userData = UserDataFactory.userData;
});