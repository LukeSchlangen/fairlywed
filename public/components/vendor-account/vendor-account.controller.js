app.controller("VendorAccountController", ["PackagesFactory", "VendorAccountFactory", "$state",
    function (PackagesFactory, VendorAccountFactory, $state) {
        var self = this;
        self.packages = PackagesFactory.packages;
        self.vendors = VendorAccountFactory.vendors;
        PackagesFactory.updateList();
        VendorAccountFactory.updateList();
        self.initialize = function() {
            var input = document.getElementById('searchTextField');
            var autocomplete = new google.maps.places.Autocomplete(input, {
              componentRestrictions: {'country': 'us'}
            });
            console.log("Initializing google maps");
            google.maps.event.addListener(autocomplete, 'place_changed', function () {
                var place = autocomplete.getPlace();
            });
        };


        self.updatePrice = function(package) {
            console.log('Package price update: ', package)
        };
        self.reloadState = function() {
            $state.reload();
        }
    }
]);