app.controller("VendorDetailsController", ["VendorDetailsFactory",
    function (VendorDetailsFactory) {
        var self = this;

        VendorDetailsFactory.getDetails();
        VendorDetailsFactory.getSubvendorList();

        self.vendor = VendorDetailsFactory.vendor;

        self.updateDetails = function(vendorDetailsToSave) {
            VendorDetailsFactory.updateDetails(vendorDetailsToSave);
        }

        self.addSubvendor = function(newSubvendor) {
            VendorDetailsFactory.addSubvendor(newSubvendor);
        }
    }
]);