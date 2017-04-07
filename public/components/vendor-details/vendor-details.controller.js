app.controller("VendorDetailsController", ["VendorDetailsFactory", "AuthFactory", "$stateParams",
    function (VendorDetailsFactory, AuthFactory, $stateParams) {
        var self = this;

        VendorDetailsFactory.updateList();

        self.vendor = VendorDetailsFactory.vendor;

        self.updateDetails = function(vendorDetailsToSave) {
            VendorDetailsFactory.updateDetails(vendorDetailsToSave);
        }

        self.addSubvendor = function(newSubvendor) {
            VendorDetailsFactory.addSubvendor(newSubvendor);
        }

        self.isCurrentSubvendor = function(subvendorToCheck){
            return subvendorToCheck == $stateParams.subvendorId;
        }
        
    }
]);