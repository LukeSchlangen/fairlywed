app.controller("VendorDetailsController", function (VendorDetailsFactory, UserDataFactory, $stateParams, $scope, StripeConnectFactory, VendorInvitationFactory) {
    var self = this;

    VendorDetailsFactory.getDetails();
    VendorDetailsFactory.getSubvendorList();

    self.vendor = VendorDetailsFactory.vendor;
    self.userData = UserDataFactory.userData;
    self.showAddNewSubvendorForm = false;
    self.showVendorInvitation = false;
    self.vendorInvitation = VendorInvitationFactory.vendorInvitation;

    StripeConnectFactory.getConnectStripeAccountUrl();

    self.connectToStripeLink = StripeConnectFactory.connectToStripeLink;

    VendorDetailsFactory.stripeAuthorizationCheck();

    self.shareWithBusinessPartner = function() {
        if (self.showVendorInvitation) {
            self.showVendorInvitation = false;
        } else {
            self.showVendorInvitation = true;
            VendorInvitationFactory.createVendorInvitation();
        }
    }

    self.vendorHasNotChanged = function() {
        var areTheyEqual = angular.equals(self.vendor.details, self.vendor.savedDetails);
        return areTheyEqual;
    }

    self.updateDetails = function (vendorDetailsToSave) {
        VendorDetailsFactory.updateDetails(vendorDetailsToSave);
    }

    self.initialize = function () {
        var input = document.getElementById('vendorLocationDetailsTextField');
        var autocomplete = new google.maps.places.Autocomplete(input, {
            componentRestrictions: { 'country': 'us' }
        });
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