app.factory("SubvendorFactory", function ($http, AuthFactory, $stateParams, VendorDetailsFactory) {

    var subvendor = { packageList: [], details: {}, imagesList: [] };

    var previousAvailabilitySearchDate = new Date();

    AuthFactory.$onAuthStateChanged(getAllLists);

    function getAllLists() {
        getDetails();
        getPackagesList();
        getAvailabilityList();
        getImagesList();
    }

    function getPackagesList() {
        $http({
            method: 'GET',
            url: '/subvendorDetailsData/packages',
            headers: {
                subvendor_id: $stateParams.subvendorId
            }
        }).then(function (response) {
            subvendor.packageList = response.data.packages;
            checkAccountStatus();
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
            subvendor.packageList = [];
        });
    }

    function getAvailabilityList(selectedDate) {
        if (selectedDate instanceof Date) {
            previousAvailabilitySearchDate = selectedDate;
        } else {
            selectedDate = previousAvailabilitySearchDate;
        }
        return $http({
            method: 'GET',
            url: '/subvendorDetailsData/availability',
            headers: {
                subvendor_id: $stateParams.subvendorId,
                selected_date: selectedDate
            }
        }).then(function (response) {
            subvendor.availabilityList = response.data;
            checkAccountStatus();
        }).catch(function (err) {
            console.error('Error retreiving subvendor availability data: ', err);
            subvendor.availabilityList = [];
        });
    }

    function getImagesList() {
        $http({
            method: 'GET',
            url: '/subvendorDetailsData/images',
            headers: {
                subvendor_id: $stateParams.subvendorId
            }
        }).then(function (response) {

            // Remove deleted images from imagesList that are not in the new response
            for (var i = subvendor.imagesList.length - 1; i >= 0; i--) {
                var imageListItem = subvendor.imagesList[i];
                if (!response.data.some(function (responseItem) {
                    return imageListItem.id == responseItem.id;
                })) {
                    subvendor.imagesList.splice(i, 1);
                }
            }

            //Find values that are in response.data but not in subvendor.imagesList
            var imagesInResponseButNotSubvendorImageList = response.data.filter(function (obj) {
                return !subvendor.imagesList.some(function (obj2) {
                    return obj.id == obj2.id;
                });
            });

            //Find values that are in result2 but not in result1
            var imagesInSubvendorImageListButNotInResponse = subvendor.imagesList.filter(function (obj) {
                return !response.data.some(function (obj2) {
                    return obj.id == obj2.id;
                });
            });

            imagesInResponseButNotSubvendorImageList.forEach(function (image) {
                subvendor.imagesList.unshift(image);
            });
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
            subvendor.imagesList = [];
        });
    }

    function getDetails() {
        $http({
            method: 'GET',
            url: '/subvendorDetailsData',
            headers: {
                subvendor_id: $stateParams.subvendorId
            }
        }).then(function (response) {
            subvendor.details = response.data;
            subvendor.savedDetails = angular.copy(subvendor.details);
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
            subvendor.details = {};
        });
    }

    function updateAllPackages(packagesToSave) {
        $http({
            method: 'POST',
            url: '/subvendorDetailsData/upsertAllPackages',
            headers: {
                subvendor_id: $stateParams.subvendorId
            },
            data: packagesToSave
        }).then(function (response) {
            getPackagesList();
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
        });
    }

    function updateAvailability(availabilityToSave, updateCalendar) {
        $http({
            method: 'POST',
            url: '/subvendorDetailsData/upsertAvailability',
            headers: {
                subvendor_id: $stateParams.subvendorId
            },
            data: availabilityToSave
        }).then(function (response) {
            getAvailabilityList(availabilityToSave.day).then(function () {
                updateCalendar();
            });
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
            getDetails();
            VendorDetailsFactory.getSubvendorList();
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
            getImagesList();
        }).catch(function (err) {
            console.error('Error retreiving private user data: ', err);
        });
    }

    function checkAccountStatus() {
        subvendor.hasActivePackages = checkActivePackages(subvendor.packageList);
        subvendor.hasFutureAvailability = checkAvailability(subvendor.availabilityList);
    }

    function checkActivePackages(packagesToCheck) {
        var hasActivePackages = false;
        if (packagesToCheck) {
            packagesToCheck.forEach(function (packageToCheck) {
                if (packageToCheck.is_active && packageToCheck.price) {
                    hasActivePackages = true;
                }
            });
        }
        return hasActivePackages;
    }

    function checkAvailability(availabilityToCheck) {
        var hasFutureAvailability = false;
        if (availabilityToCheck) {
            availabilityToCheck.forEach(function (availabilityToCheck) {
                if (availabilityToCheck.status == 'available') {
                    hasFutureAvailability = true;
                }
            });
        }
        return hasFutureAvailability;
    }

    return {
        getDetails: getDetails,
        getPackagesList: getPackagesList,
        getAvailabilityList: getAvailabilityList,
        getImagesList: getImagesList,
        subvendor: subvendor,
        updateDetails: updateDetails,
        updateAllPackages: updateAllPackages,
        updateAvailability: updateAvailability,
        saveImage: saveImage
    };
});