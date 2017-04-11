app.controller("SubvendorAvailabilityDetailsController", function (SubvendorFactory) {
    var self = this;

    self.subvendor = SubvendorFactory.subvendor;

    SubvendorFactory.getAvailabilityList();

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
});