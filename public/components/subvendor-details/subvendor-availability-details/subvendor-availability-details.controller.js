app.controller("SubvendorAvailabilityDetailsController", function (SubvendorFactory, $filter) {
    var self = this;

    self.subvendor = SubvendorFactory.subvendor;

    function availabilityObjectFromDate(date) {
        var javascriptDate = new Date(date);

        var correspondingAvailability = {
            day: javascriptDate
        };

        // Searches to see if the date already exists, if it does, this will make it toggle correctly
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

    self.updateMultipleAvailabilities = function (dayOfWeek, updatedStatus) {

        // var start = moment();


        var weekDayToFind = moment().day(dayOfWeek).weekday(); //change to searched day name

        var startDate = moment(); //now or change to any date
        while (startDate.weekday() !== weekDayToFind){ 
            startDate = startDate.add(1, 'day'); 
        }

        var end = moment().add(2, 'years');

        var availability = {
            status: updatedStatus,
            day: []  
        };

        var current = startDate.clone();

        while (current.isBefore(end)) {
            availability.day.push(current.clone());
            current = current.add(7, 'days');
        }

        SubvendorFactory.updateAvailability(availability, self.setData);
    };
});