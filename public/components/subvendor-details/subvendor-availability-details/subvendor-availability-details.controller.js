app.controller("SubvendorAvailabilityDetailsController", function (SubvendorFactory, $filter) {
    var self = this;

    self.subvendor = SubvendorFactory.subvendor;

    SubvendorFactory.getAvailabilityList(new Date());

    self.isSaturday = function (dayToCheck) {
        dayToCheck = new Date(dayToCheck);
        return dayToCheck.getDay() == 6;
    }

    self.toggleAvailability = function (availability) {
        if (availability.status == 'booked') {
            alert('This date has already been booked and cannot be made unavailable.')
        } else if (availability.status == 'available') {
            availability.status = 'unavailable';
        } else {
            availability.status = 'available';
        }
        SubvendorFactory.updateAvailability(availability);
    }





    self.msg = {};
    self.msg.text = "This is a message!"

    self.dayFormat = "d";

    // To select a single date, make sure the ngModel is not an array.
    self.selectedDate = null;

    // If you want multi-date select, initialize it as an array.
    self.selectedDate = '';

    self.firstDayOfWeek = 0; // First day of the week, 0 for Sunday, 1 for Monday, etc.
    self.setDirection = function (direction) {
        self.direction = direction;
        self.dayFormat = direction === "vertical" ? "EEEE, MMMM d" : "d";
    };

    self.dayClick = function (date) {
        self.msg.text = "You clicked " + $filter("date")(date, "MMM d, y h:mm:ss a Z");
    };

    self.prevMonth = function (data, updateCalendar) {
        self.msg.text = "You clicked (next) month " + data.month + ", " + data.year;

        var firstOfMonth = new Date(data.year, data.month - 1, 1);

        SubvendorFactory.getAvailabilityList(firstOfMonth).then(function () {
            updateCalendar();
        });
    };

    self.nextMonth = function (data, updateCalendar) {
        self.msg.text = "You clicked (next) month " + data.month + ", " + data.year;

        var firstOfMonth = new Date(data.year, data.month - 1, 1);

        SubvendorFactory.getAvailabilityList(firstOfMonth).then(function () {
            updateCalendar();
        });
    };

    self.tooltips = true;
    self.setDayContent = function (date) {

        // You would inject any HTML you wanted for
        // that particular date here.
        // console.log(date);
        // This is where to check each date and update available or unavailable based on result
        return '<p>' + self.msg.text + '</p>';

        //     // You could also use an $http function directly.
        //     return $http.get("/some/external/api");

        //     // You could also use a promise.
        //     var deferred = $q.defer();
        //     $timeout(function() {
        //         deferred.resolve("<p></p>");
        //     }, 1000);
        //     return deferred.promise;

    };
});