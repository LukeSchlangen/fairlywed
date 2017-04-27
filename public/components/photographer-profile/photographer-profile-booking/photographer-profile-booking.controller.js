app.controller("PhotographerProfileBookingController", ["PhotographerSearchFactory", "PhotographerBookingFactory", "StripeCheckout",
    function (PhotographerSearchFactory, PhotographerBookingFactory, StripeCheckout) {
        var self = this;
        self.bookingDetails = PhotographerBookingFactory.bookingDetails;
        self.currentSubvendor = PhotographerSearchFactory.currentSubvendor;  
        PhotographerSearchFactory.getSubvendorProfileDetails();

        // Stripe implementation
        // You should configure a handler when the view is loaded,
        // just as you would if you were using checkout.js directly.
        var handler = StripeCheckout.configure({
            name: "Custom Example",
            token: function (token, args) {
                PhotographerBookingFactory.bookPhotographer(token);
            }
        });
        self.doCheckout = function (token, args) {
            var options = {
                description: "Book the day!",
                amount: PhotographerSearchFactory.currentSubvendor.details.currentPackage.price * 100
            };
            // The default handler API is enhanced by having open()
            // return a promise. This promise can be used in lieu of or
            // in addition to the token callback (or you can just ignore
            // it if you like the default API).
            //
            // The rejection callback doesn't work in IE6-7.
            handler.open(options)
                // .then(function (result) {
                //     alert("Got Stripe token: " + result[0].id);
                // }, function () {
                //     alert("Stripe Checkout closed without making a sale :(");
                // });
        };
    }
]);