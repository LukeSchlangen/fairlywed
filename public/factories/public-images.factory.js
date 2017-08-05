app.factory("PublicImagesFactory", function ($http, $stateParams) {

    var images = { list: [] };

    function updateImagesList() {
        $http({
            method: 'GET',
            url: '/galleryImages',
            headers: {
                subvendor_id: $stateParams.subvendorId
            }
        }).then(function (response) {
            images.list = response.data;
        }).catch(function (err) {
            console.error('Error retreiving photographer data: ', err);
        });
    }

    return {
        images: images,
        updateImagesList: updateImagesList
    };
});