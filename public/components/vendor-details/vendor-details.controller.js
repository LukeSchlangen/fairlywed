app.controller("VendorDetailsController", function (VendorDetailsFactory, $stateParams) {
    var self = this;

    VendorDetailsFactory.getDetails();
    VendorDetailsFactory.getSubvendorList();

    self.vendor = VendorDetailsFactory.vendor;

    self.updateDetails = function (vendorDetailsToSave) {
        VendorDetailsFactory.updateDetails(vendorDetailsToSave);
    }

    // Should build something like https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_AV83SzOuXp4xnSFtdNewKemvF0hTuSiZ&scope=read_write&redirect_uri=https://localhost:5000/#/account/vendor
    self.stripeUrl = stripeConfig.authorizeUrl + 
                    '?response_type=' + stripeConfig.responseType +
                    '&client_id=' + stripeConfig.clientId +
                    '&scope=' + stripeConfig.scope +
                    '&redirect_uri=' + stripeConfig.redirectUri;

    self.addSubvendor = function () {
        VendorDetailsFactory.addSubvendor(self.newSubvendor);
        self.newSubvendor = {};
    }

    self.isCurrentSubvendor = function(subvendorIdToCheck) {
        return $stateParams.subvendorId == subvendorIdToCheck;
    }
});