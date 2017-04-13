app.controller("VendorDetailsController", function (VendorDetailsFactory, $stateParams) {
    var self = this;

    VendorDetailsFactory.getDetails();
    VendorDetailsFactory.getSubvendorList();

    self.vendor = VendorDetailsFactory.vendor;

    self.updateDetails = function (vendorDetailsToSave) {
        VendorDetailsFactory.updateDetails(vendorDetailsToSave);
    }

    self.addSubvendor = function () {
        VendorDetailsFactory.addSubvendor(self.newSubvendor);
        self.newSubvendor = {};
    }

    self.isCurrentSubvendor = function(subvendorIdToCheck) {
        return $stateParams.subvendorId == subvendorIdToCheck;
    }
});