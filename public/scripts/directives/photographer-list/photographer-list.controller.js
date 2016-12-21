app.controller("PhotographerListController", ["Auth", "PhotographerFactory",
    function (authFactory, PhotographerFactory) {
        var self = this;
        self.auth = authFactory;
        self.photographerFactory = PhotographerFactory;
        self.photographerList = [];

        // any time auth state changes, return back to default list of photographers
        self.auth.$onAuthStateChanged(function (firebaseUser) {
            self.firebaseUser = firebaseUser;
            self.photographerFactory.getPhotographers().then(function(data){
                self.photographerList = data;
                console.log('data returned is: ', data);
            })
        });
    }
]);