app.factory("PhotographerSearchFactory", function (PackagesFactory, $http, $stateParams, $state) {

    var packages = { list: [] };
    var packageComponents = {
        numberOfPhotographers: null,
        numberOfHours: null,
        engagementSessionIsIncluded: null
    };
    var photographers = { list: [] };
    var functionsToExecuteOnSearchChange = [];

    // -- SETTING DEFAULT VALUES FOR SEARCH OR GETTING THEM FROM STATE PARAMETERS ROUTING -- //
    var search = {};
    function updateSearchParameters() {
        search.parameters = {};
        search.parameters.location = $stateParams.location || "Minneapolis, MN, USA";
        search.parameters.longitude = $stateParams.longitude || -93.26501080000003;
        search.parameters.latitude = $stateParams.latitude || 44.977753;
        search.parameters.package = $stateParams.package ? $stateParams.package : setDefaultPackage();
        search.parameters.date = $stateParams.date ? new Date($stateParams.date) : saturdayOneYearFromNow();
        packages = PackagesFactory.packages;
        photographers = { list: [] };
        search.parameters.subvendorId = $stateParams.subvendorId ? $stateParams.subvendorId : search.parameters.subvendorId;
        updateCurrentSubvendorCurrentPackage();
    }
    // ------------------------------------------------------------------------------------ //

    // -- RETURNING LIST OF PHOTOGRAPHERS BASED ON SEARCH PARAMETERS -- //
    function updatePhotographersList() {
        if ($stateParams) {
            updateSearchParameters();
            if (search.parameters.package && search.parameters.longitude && search.parameters.latitude) {
                if (packages.list.length > 0) {
                    search.parameters.package = updatePackageBasedOnComponents(packages.list, search.parameters.package);
                }
                search.parameters.vendorType = 'photographer';
                var searchObject = angular.copy(search.parameters);
                searchObject.date = pgFormatDate(searchObject.date);
                $http({
                    method: 'GET',
                    url: '/vendorSearchData',
                    params: { search: searchObject }
                }).then(function (response) {
                    photographers.list = response.data;
                }).catch(function (err) {
                    console.error('Error retreiving photographer data: ', err);
                });
            } else {
                console.error("All photographer searches must have a package id, longitude, and latitude");
            }

            // update route parameters based on search
            var newStateParameters = angular.copy(search.parameters);
            newStateParameters.package = search.parameters.package;
            newStateParameters.date = stringifyDate(search.parameters.date);
            $state.transitionTo($state.current.name, newStateParameters, { notify: false });
            updateCurrentSubvendorCurrentPackage();
            executeSearchChangedFunctions();
        }
    }
    // --------------------------------------------------------------- //

    // -- PROFILE VIEW CURRENT PHOTOGRAPHER INFROMATION RETREIVAL - MORE DETAILS ABOUT ONE PHOTOGRAPHER -- //
    var currentSubvendor = { details: {} };

    function getSubvendorProfileDetails() {
        if ($stateParams) {
            updateSearchParameters();
            // Description
            if (search.parameters.package && search.parameters.longitude && search.parameters.latitude && search.parameters.subvendorId) {
                search.parameters.vendorType = 'photographer';
                var searchObject = angular.copy(search.parameters);
                searchObject.date = pgFormatDate(searchObject.date);
                $http({
                    method: 'GET',
                    url: '/vendorSearchData/subvendorProfile',
                    params: { search: searchObject }
                }).then(function (response) {
                    currentSubvendor.details = response.data;
                    updateCurrentSubvendorCurrentPackage();
                }).catch(function (err) {
                    console.error('Error retreiving photographer profile data: ', err);
                });
            } else {
                console.error("All photographer searches must have a package id, longitude, latitude, and subvendorId. Current object is:", search.parameters);
            }

            // update route parameters based on search
            var newStateParameters = angular.copy(search.parameters);
            newStateParameters.package = search.parameters.package;
            newStateParameters.date = stringifyDate(search.parameters.date);
            $state.transitionTo($state.current.name, newStateParameters, { notify: false });
            updateCurrentSubvendorCurrentPackage();
        }
    }
    // ------------------------------------------------------------------------------------ //

    function updateCurrentSubvendorCurrentPackage() {
        if (currentSubvendor && currentSubvendor.details) {
            currentSubvendor.details.currentPackage = {};
            if (currentSubvendor.details.packages && search.parameters && search.parameters.package) {
                currentSubvendor.details.packages.forEach(function (packageToCheck) {
                    if (packageToCheck.id == search.parameters.package) {
                        currentSubvendor.details.currentPackage = packageToCheck;
                    }
                });
            }
        }
    }

    function onSearchParametersChanged(functionToExecuteOnSearchChange) {
        functionsToExecuteOnSearchChange.push(functionToExecuteOnSearchChange);
    }

    function executeSearchChangedFunctions() {
        functionsToExecuteOnSearchChange.forEach(function (individualFunction) {
            individualFunction();
        });
    }

    function setDefaultPackage() {
        packageComponents.numberOfPhotographers = 2;
        packageComponents.numberOfHours = 8;
        packageComponents.engagementSessionIsIncluded = false;
        return 2;
    }

    function updatePackageBasedOnComponents(packageList, currentPackageId) {
        if (packageComponents.numberOfHours && packageComponents.numberOfPhotographers) {
            // use current package components to determine package
            for (var i = 0; i < packageList.length; i++) {
                packageList[i].engagement_session_is_included = !!packageList[i].engagement_session_is_included;
                var numberOfPhotographersIsCorrect = packageComponents.numberOfPhotographers == packageList[i].number_of_photographers;
                var numberOfHoursIsCorrect = packageComponents.numberOfHours == packageList[i].number_of_hours;
                var engagementSessionIsIncludedIsCorrect = packageComponents.engagementSessionIsIncluded == packageList[i].engagement_session_is_included;
                if (numberOfPhotographersIsCorrect && numberOfHoursIsCorrect && engagementSessionIsIncludedIsCorrect) {
                    return packageList[i].id;
                }
            }
        } else {
            // use current package to determine the components
            for (var i = 0; i < packageList.length; i++) {
                if (packageList[i].id == currentPackageId) {
                    packageComponents.numberOfPhotographers = packageList[i].number_of_photographers;
                    packageComponents.numberOfHours = packageList[i].number_of_hours;
                    packageComponents.engagementSessionIsIncluded = packageList[i].engagement_session_is_included;
                    return packageList[i].id;
                }
            }
        }
        console.error('Something went wrong, packageList was', packageList)
        console.error('currentPackageId was', currentPackageId)
    }

    function saturdayOneYearFromNow() {
        var weekDayToFind = moment().day('saturday').weekday(); //change to searched day name

        var saturdayOneYearFromToday = moment().add(1, 'years');

        while (saturdayOneYearFromToday.weekday() !== weekDayToFind) {
            saturdayOneYearFromToday = saturdayOneYearFromToday.add(1, 'day');
        }

        return new Date(saturdayOneYearFromToday.toISOString());
    }

    function stringifyDate(dateToStringify) {
        var javascriptDateFormat = new Date(moment(dateToStringify).toISOString());
        return javascriptDateFormat.toDateString();
    }

    function pgFormatDate(date) {
        // via https://stackoverflow.com/questions/44988104/remove-time-and-timezone-from-string-dates/44997832#44997832
        if (typeof date != "string") {
            date = date.toDateString();
        }

        if (date) {
            if (moment(date.substring(4, 15), 'MMM DD YYYY').isValid() && date.substring(4, 15).length === 11) {
                // this handles dates like: "Fri Jul 06 2017 22:10:08 GMT-0500 (CDT)"    
                return moment(date.substring(4, 15), 'MMM DD YYYY').format('YYYY-MM-DD');
            } else if (moment(date.substring(0, 10), "YYYY-MM-DD").isValid() && date.substring(0, 10).length === 10) {
                // this handles dates like: "2017-07-06T02:59:12.037Z" and "2017-07-06"
                return date.substring(0, 10);
            } else {
                throw 'Date not formatted correctly';
            }
        } else {
            throw 'Date must exists for availability to insert'
        }
    }

    return {
        packages: packages,
        packageComponents: packageComponents,
        photographers: photographers,
        updatePhotographersList: updatePhotographersList,
        currentSubvendor: currentSubvendor,
        getSubvendorProfileDetails: getSubvendorProfileDetails,
        search: search,
        $onSearchParametersChanged: onSearchParametersChanged
    };
});