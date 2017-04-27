app.controller("PhotographerListController", function (PhotographerSearchFactory, $stateParams) {
    var self = this;

    self.params = $stateParams;
    self.photographers = PhotographerSearchFactory.photographers;
    self.formatRating = function (rating) {
        if (rating > 99) {
            return '>' + 99 + '%';
        } else if (rating < 1) {
            return '<' + 1 + '%';
        } else {
            return Math.round(rating) + '%';
        }
    }
});