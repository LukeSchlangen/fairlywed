app.controller("VendorDetailsController", function (VendorDetailsFactory, $stateParams) {
    var self = this;

    VendorDetailsFactory.getDetails();
    VendorDetailsFactory.getSubvendorList();

    self.vendor = VendorDetailsFactory.vendor;

    self.updateDetails = function (vendorDetailsToSave) {
        VendorDetailsFactory.updateDetails(vendorDetailsToSave);
    }

    self.addSubvendor = function (newSubvendor) {
        VendorDetailsFactory.addSubvendor(newSubvendor);
    }

    self.isCurrentSubvendor = function(subvendorIdToCheck) {
        return $stateParams.subvendorId == subvendorIdToCheck;
    }
});