app.factory("SubvendorFactory", ["$http", "AuthFactory", "$stateParams", 'Upload', function ($http, AuthFactory, $stateParams, Upload) {

    var subvendor = { packageList: [], details: {}, imagesList: [] };

    AuthFactory.$onAuthStateChanged(updateList);

    function updateList() {

        $http({
            method: 'GET',
            url: '/subvendorDetailsData/packages',
            headers: {
                subvendor_id: $stateParams.subvendorId
            }
        }).then(function (response) {
            console.log('subvendor details factory returned: ', response.data);
            subvendor.packageList = response.data.packages;
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
            subvendor.packageList = [];
        });

        $http({
            method: 'GET',
            url: '/subvendorDetailsData/availability',
            headers: {
                subvendor_id: $stateParams.subvendorId
            }
        }).then(function (response) {
            console.log('subvendor details factory returned: ', response.data);
            subvendor.availabilityList = response.data;
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
            subvendor.availabilityList = [];
        });

        $http({
            method: 'GET',
            url: '/subvendorDetailsData/images',
            headers: {
                subvendor_id: $stateParams.subvendorId
            }
        }).then(function (response) {
            console.log('subvendors controller returned: ', response.data);
            subvendor.imagesList = response.data;
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
            subvendor.imagesList = [];
        });

        $http({
            method: 'GET',
            url: '/subvendorDetailsData',
            headers: {
                subvendor_id: $stateParams.subvendorId
            }
        }).then(function (response) {
            console.log('subvendors controller returned: ', response.data);
            subvendor.details = response.data;
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
            subvendor.details = {};
        });
    }

    function updatePackage(packageToSave) {
        $http({
            method: 'POST',
            url: '/subvendorDetailsData/upsertPackage',
            headers: {
                subvendor_id: $stateParams.subvendorId
            },
            data: packageToSave
        }).then(function (response) {
            console.log('subvendor details controller returned: ', response.data);
            updateList();
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
        });
    }

    function updateAvailability(availabilityToSave) {
        $http({
            method: 'POST',
            url: '/subvendorDetailsData/upsertAvailability',
            headers: {
                subvendor_id: $stateParams.subvendorId
            },
            data: availabilityToSave
        }).then(function (response) {
            console.log('subvendor details controller returned: ', response.data);
            updateList();
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
        });
    }

    function updateDetails(subvendorToSave) {
        $http({
            method: 'PUT',
            url: '/subvendorDetailsData',
            headers: {
                subvendor_id: $stateParams.subvendorId
            },
            data: subvendorToSave
        }).then(function (response) {
            console.log('subvendor factory returned: ', response.data);
            updateList();
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
        });
    }

    function saveImage(imageToSave) {
        $http({
            method: 'PUT',
            url: '/subvendorDetailsData/updateImage',
            headers: {
                subvendor_id: $stateParams.subvendorId
            },
            data: imageToSave
        }).then(function (response) {
            console.log('subvendor factory returned: ', response.data);
            updateList();
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
        });
    }

    function addNewImage(newImage) {
        Upload.upload({
            url: '/uploads',
            method: 'POST',
            headers: {
                subvendor_id: $stateParams.subvendorId
            },
            data: newImage
        }).then(function (response) {
            console.log(response.data);
            updateList();
        })
    }

    return {
        addNewImage: addNewImage,
        subvendor: subvendor,
        updateDetails: updateDetails,
        updateList: updateList,
        updatePackage: updatePackage,
        updateAvailability: updateAvailability,
        saveImage: saveImage
    };
}]);