app.controller("VendorDetailsController", ["VendorDetailsFactory", "AuthFactory",
    function (VendorDetailsFactory, AuthFactory) {
        var self = this;

        VendorDetailsFactory.updateList();

        self.vendor = VendorDetailsFactory.vendor;
    }
]);