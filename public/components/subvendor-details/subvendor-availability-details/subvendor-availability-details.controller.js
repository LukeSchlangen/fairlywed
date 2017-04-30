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

    self.msg = {};
    self.msg.text = "This is a message!"

    self.dayFormat = "d";

    self.initialDataRetrieval = SubvendorFactory.getAvailabilityList;

    // To select a single date, make sure the ngModel is not an array.
    self.selectedDate = null;

    // If you want multi-date select, initialize it as an array.
    self.selectedDate = '';

    self.firstDayOfWeek = 0; // First day of the week, 0 for Sunday, 1 for Monday, etc.
    self.setDirection = function (direction) {
        self.direction = direction;
        self.dayFormat = direction === "vertical" ? "EEEE, MMMM d" : "d";
    };

    self.dayClick = function (date, updateCalendar) {
        self.msg.text = "You clicked " + $filter("date")(date, "MMM d, y h:mm:ss a Z");

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

    self.prevMonth = function (data, updateCalendar) {
        self.msg.text = "You clicked (next) month " + data.month + ", " + data.year;

        var dayInMonth = new Date(data.year, data.month - 1, 1);

        SubvendorFactory.getAvailabilityList(dayInMonth).then(function () {
            updateCalendar();
        });
    };

    self.nextMonth = function (data, updateCalendar) {
        self.msg.text = "You clicked (next) month " + data.month + ", " + data.year;

        var dayInMonth = new Date(data.year, data.month - 1, 1);

        SubvendorFactory.getAvailabilityList(dayInMonth).then(function () {
            updateCalendar();
        });
    };

    self.tooltips = true;
    self.setDayContent = function (date) {
        return '<p>' + availabilityObjectFromDate(date).status + '</p>';
    };
});