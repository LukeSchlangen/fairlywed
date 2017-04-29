app.controller("VendorDetailsController", function (VendorDetailsFactory, UserDataFactory, $stateParams, $scope, StripeConnectFactory) {
    var self = this;

    VendorDetailsFactory.getDetails();
    VendorDetailsFactory.getSubvendorList();

    self.vendor = VendorDetailsFactory.vendor;
    self.userData = UserDataFactory.userData;
    self.showAddNewSubvendorForm = false;

    StripeConnectFactory.getConnectStripeAccountUrl();

    self.connectToStripeLink = StripeConnectFactory.connectToStripeLink;

    VendorDetailsFactory.stripeAuthorizationCheck();

    self.updateDetails = function (vendorDetailsToSave) {
        VendorDetailsFactory.updateDetails(vendorDetailsToSave);
    }

    self.initialize = function () {
        var input = document.getElementById('vendorLocationDetailsTextField');
        var autocomplete = new google.maps.places.Autocomplete(input, {
            componentRestrictions: { 'country': 'us' }
        });
        console.log("Initializing google maps");
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            self.vendor.details.latitude = place.geometry.location.lat();
            self.vendor.details.longitude = place.geometry.location.lng();
            self.vendor.details.location_address = place.formatted_address;
            $scope.$apply();
        });
    }

    self.addSubvendor = function () {
        VendorDetailsFactory.addSubvendor(self.newSubvendor);
        self.newSubvendor = {};
        self.showAddNewSubvendorForm = false;
    }

    self.isCurrentSubvendor = function (subvendorIdToCheck) {
        return $stateParams.subvendorId == subvendorIdToCheck;
    }
});