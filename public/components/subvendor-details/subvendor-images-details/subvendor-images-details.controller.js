app.controller("SubvendorImagesDetailsController", function (SubvendorFactory, $stateParams, AuthFactory) {
    var self = this;

    self.subvendor = SubvendorFactory.subvendor;

    SubvendorFactory.getImagesList();

    self.saveImage = SubvendorFactory.saveImage;

    // Dropzone Upload Handled Here
    self.dzOptions = {
        url: '/uploads',
        headers: {
            subvendor_id: $stateParams.subvendorId
        },
        addRemoveLinks: true,
        paramName: "file",
        filesizeBase: 1024,
        maxFilesize: 5 // MB
    };

    // It Doesn't get intercepted by the http-interceptor
    // so we have to add it here 
    var firebaseUser = AuthFactory.$getAuth();
    firebaseUser.getToken().then(function (idToken) {
        self.dzOptions.headers.id_token = idToken;
    });

    self.dzCallbacks = {
        'success': function (file) {
            SubvendorFactory.getImagesList();
            self.dzMethods.removeFile(file);
        }
    };
});