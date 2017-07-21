app.factory("PhotographerSearchFactory", function (PackagesFactory, $http, $stateParams, $state) {

    console.log('photographer factory logging $stateParams: ', $stateParams);

    var packages = { list: [] };
    var photographers = { list: [] };
    var functionsToExecuteOnSearchChange = [];

    // -- SETTING DEFAULT VALUES FOR SEARCH OR GETTING THEM FROM STATE PARAMETERS ROUTING -- //
    var search = {};
    updateSearchParameters();
    function updateSearchParameters() {
        search.parameters = {};
        search.parameters.location = $stateParams.location || "Minneapolis, MN, USA";
        search.parameters.longitude = $stateParams.longitude || -93.26501080000003;
        search.parameters.latitude = $stateParams.latitude || 44.977753;
        search.parameters.package = $stateParams.package ? $stateParams.package : 2;
        search.parameters.date = $stateParams.date ? new Date($stateParams.date) : saturdayOneYearFromNow();
        packages = PackagesFactory.packages;
        photographers = { list: [] };
        search.parameters.subvendorId = $stateParams.subvendorId;
        updateCurrentSubvendorCurrentPackage();
    }
    // ------------------------------------------------------------------------------------ //

    // -- RETURNING LIST OF PHOTOGRAPHERS BASED ON SEARCH PARAMETERS -- //
    function updatePhotographersList() {
        if (search.parameters.package && search.parameters.longitude && search.parameters.latitude) {
            search.parameters.vendorType = 'photographer';
            var searchObject = angular.copy(search.parameters);
            searchObject.date = pgFormatDate(searchObject.date);
            $http({
                method: 'GET',
                url: '/vendorSearchData',
                params: { search: searchObject }
            }).then(function (response) {
                console.log('Photographer factory received photographer data from the server: ', response.data);
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
        console.log('$state is currently:', $state);
        console.log('newStateParameters:', newStateParameters)
        $state.transitionTo($state.current.name, newStateParameters, { notify: false });
        updateCurrentSubvendorCurrentPackage();
        executeSearchChangedFunctions();
    }
    // --------------------------------------------------------------- //

    // -- PROFILE VIEW CURRENT PHOTOGRAPHER INFROMATION RETREIVAL - MORE DETAILS ABOUT ONE PHOTOGRAPHER -- //
    var currentSubvendor = {};

    function getSubvendorProfileDetails() {
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
                console.log('Photographer factory received photographer profile data from the server: ', response.data);
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
        console.log('$state is currently:', $state);
        console.log('newStateParameters:', newStateParameters)
        $state.transitionTo($state.current.name, newStateParameters, { notify: false });
        updateCurrentSubvendorCurrentPackage();
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

    function onSearchParametersChanged (functionToExecuteOnSearchChange) {
        functionsToExecuteOnSearchChange.push(functionToExecuteOnSearchChange);
    }

    function executeSearchChangedFunctions() {
        functionsToExecuteOnSearchChange.forEach(function(individualFunction) {
            individualFunction();
        });
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
        photographers: photographers,
        updatePhotographersList: updatePhotographersList,
        currentSubvendor: currentSubvendor,
        getSubvendorProfileDetails: getSubvendorProfileDetails,
        search: search,
        $onSearchParametersChanged: onSearchParametersChanged
    };
});