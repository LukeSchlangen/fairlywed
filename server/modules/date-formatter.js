var moment = require('moment');

function javascriptToPostgres(date) {
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

module.exports = {
    javascriptToPostgres: javascriptToPostgres
}