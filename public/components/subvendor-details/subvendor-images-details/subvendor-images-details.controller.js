app.controller("SubvendorImagesDetailsController", function (SubvendorFactory) {
    var self = this;

    self.subvendor = SubvendorFactory.subvendor;

    SubvendorFactory.getImagesList();

    self.saveImage = SubvendorFactory.saveImage;
    self.uploadImage = SubvendorFactory.addNewImage;
});