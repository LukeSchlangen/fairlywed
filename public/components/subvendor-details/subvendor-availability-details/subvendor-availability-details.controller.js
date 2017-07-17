app.controller("SubvendorAvailabilityDetailsController", function (SubvendorFactory, $filter) {
    var self = this;

    self.subvendor = SubvendorFactory.subvendor;

    function availabilityObjectFromDate(date) {
        var javascriptDate = new Date(date);

        var correspondingAvailability = {
            day: javascriptDate,
            status: 'unavailable'
        };

        // Searches to see if the date already exists, if it does, this will make it toggle correctly
        SubvendorFactory.subvendor.availabilityList.forEach(function (availability) {
            if (pgFormatDate(javascriptDate) == availability.day.substr(0, 10)) {
                correspondingAvailability = availability;
            }
        });

        return correspondingAvailability;
    }

    self.dayFormat = "d";

    self.initialDataRetrieval = SubvendorFactory.getAvailabilityList;

    // To select a single date, make sure the ngModel is not an array.
    self.selectedDate = null;

    self.firstDayOfWeek = 0; // First day of the week, 0 for Sunday, 1 for Monday, etc.
    self.setDirection = function (direction) {
        self.direction = direction;
        self.dayFormat = direction === "vertical" ? "EEEE, MMMM d" : "d";
    };

    self.dayClick = function (date) {
        var availability = availabilityObjectFromDate(date);

        if (availability.status == 'booked') {
            alert('This date has already been booked and cannot be made unavailable.')
        } else if (availability.status == 'available') {
            availability.status = 'unavailable';
        } else {
            availability.status = 'available';
        }

        SubvendorFactory.updateAvailability(availability, self.setData);
    };

    self.tooltips = true;
    self.setDayContent = function (date) {

        var fullStatusText = availabilityObjectFromDate(date).status;
        var abreviatedStatusText = 'Unvbl';

        if (fullStatusText == 'available') {
            fullStatusText = 'Available';
            abreviatedStatusText = 'Avlbl';
        } else if (fullStatusText == 'booked') {
            fullStatusText = 'Booked';
            abreviatedStatusText = 'Bookd';
        } else {
            fullStatusText = 'Unavailable';
        }

        return '<span hide-gt-md>' + abreviatedStatusText + '</span>' +
            '<span hide-xs hide-sm hide-md>' + fullStatusText + '</span>';
    };

    self.updateMultipleAvailabilities = function (dayOfWeek, updatedStatus) {

        // var start = moment();


        var weekDayToFind = moment().day(dayOfWeek).weekday(); //change to searched day name

        var startDate = moment(); //now or change to any date
        while (startDate.weekday() !== weekDayToFind) {
            startDate = startDate.add(1, 'day');
        }

        var end = moment().add(2, 'years');

        var availability = {
            status: updatedStatus,
            day: []
        };

        var current = startDate.clone();

        while (current.isBefore(end)) {
            availability.day.push(pgFormatDate(stringifyDate(current.clone())));
            current = current.add(7, 'days');
        }

        SubvendorFactory.updateAvailability(availability, self.setData);
    };

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
});