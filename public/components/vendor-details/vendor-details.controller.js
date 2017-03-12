app.controller("VendorDetailsController", ["VendorDetailsFactory", "AuthFactory",
    function (VendorDetailsFactory, AuthFactory) {
        var self = this;

        VendorDetailsFactory.updateList();

        self.vendor = VendorDetailsFactory.vendor;

        self.updateDetails = function(vendorDetailsToSave) {
            VendorDetailsFactory.updateDetails(vendorDetailsToSave);
        }

        self.addSubvendor = function(newSubvendor) {
            VendorDetailsFactory.addSubvendor(newSubvendor);
        }
    }
]);