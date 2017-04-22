app.controller("VendorDetailsController", function (VendorDetailsFactory, $stateParams, StripeConnectFactory) {
    var self = this;

    VendorDetailsFactory.getDetails();
    VendorDetailsFactory.getSubvendorList();

    self.vendor = VendorDetailsFactory.vendor;

    self.connectStripeAccount = StripeConnectFactory.connectStripeAccount;

    self.updateDetails = function (vendorDetailsToSave) {
        VendorDetailsFactory.updateDetails(vendorDetailsToSave);
    }

    self.addSubvendor = function () {
        VendorDetailsFactory.addSubvendor(self.newSubvendor);
        self.newSubvendor = {};
    }

    self.isCurrentSubvendor = function (subvendorIdToCheck) {
        return $stateParams.subvendorId == subvendorIdToCheck;
    }
});