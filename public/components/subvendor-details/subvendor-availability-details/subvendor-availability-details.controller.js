app.controller("SubvendorAvailabilityDetailsController", function (SubvendorFactory, $filter) {
    var self = this;

    self.subvendor = SubvendorFactory.subvendor;

    function availabilityObjectFromDate(date) {
        var javascriptDate = new Date(date);

        var correspondingAvailability = {};

        SubvendorFactory.subvendor.availabilityList.forEach(function (availability) {
            if (sameDay(javascriptDate, new Date(availability.day))) {
                correspondingAvailability = availability;
            }
        });

        return correspondingAvailability;

    }

    function sameDay(firstDay, secondDay) {
        return firstDay.getFullYear() === secondDay.getFullYear()
            && firstDay.getDate() === secondDay.getDate()
            && firstDay.getMonth() === secondDay.getMonth();
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

    self.dayClick = function (date, updateCalendar) {
        var availability = availabilityObjectFromDate(date);
        
        if (availability.status == 'booked') {
            alert('This date has already been booked and cannot be made unavailable.')
        } else if (availability.status == 'available') {
            availability.status = 'unavailable';
        } else {
            availability.status = 'available';
        }

        SubvendorFactory.updateAvailability(availability, updateCalendar);
    };

    self.tooltips = true;
    self.setDayContent = function (date) {

        var fullStatusText = availabilityObjectFromDate(date).status;
        var abreviatedStatusText = 'Unvbl';

        if(fullStatusText == 'available') {
            fullStatusText = 'Available';
            abreviatedStatusText = 'Avlbl';
        } else if(fullStatusText == 'booked') {
            fullStatusText = 'Booked';
            abreviatedStatusText = 'Bookd';
        } else {
            fullStatusText = 'Unavailable';
        }
        
        return '<span hide-gt-md>' + abreviatedStatusText + '</span>' +
            '<span hide-xs hide-sm hide-md>' + fullStatusText + '</span>';
    };
});