app.controller("SubvendorImagesDetailsController", function (SubvendorFactory, $stateParams, AuthFactory) {
    var self = this;

    self.subvendor = SubvendorFactory.subvendor;

    SubvendorFactory.getImagesList();

    self.saveImage = SubvendorFactory.saveImage;
    self.uploadImage = SubvendorFactory.addNewImage;

    self.upload = {};

    self.dzOptions = {
        url: '/uploads',
        headers: {
            subvendor_id: $stateParams.subvendorId
        },
        paramName: "file", // The name that will be used to transfer the file
        maxFilesize: 5, // MB
        // accept: function (file, done) {
        //     // if (file.name == "justinbieber.jpg") {
        //     //     done("Naha, you don't.");
        //     // }
        //     // else { done(); }
        //     SubvendorFactory.saveImage(self.upload);
        //     done();
        // }
    };

    AuthFactory.$onAuthStateChanged(function (firebaseUser) {
        firebaseUser.getToken(function (idToken) {
            self.dzOptions.headers.id_token = idToken;
        })
    });

    self.dzCallbacks = {
        'addedfile': function (file) {
            console.log(file);
            self.upload.file = file;
            // SubvendorFactory.saveImage(self.upload);
        },
        'success': function (file, xhr) {
            console.log(file, xhr);
        }
    };
});