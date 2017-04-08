app.factory("PublicImagesFactory", function ($http, $stateParams) {

    var images = { list: [] };

    updateImagesList()

    function updateImagesList() {
        $http({
            method: 'GET',
            url: '/galleryImages',
            headers: {
                subvendor_id: $stateParams.subvendorId
            }
        }).then(function (response) {
            console.log('Photographer factory received photographer data from the server: ', response.data);
            images.list = response.data;
        }).catch(function (err) {
            console.error('Error retreiving photographer data: ', err);
        });
    }

    return {
        images: images
    };
});