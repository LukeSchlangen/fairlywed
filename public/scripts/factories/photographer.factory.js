app.factory("PhotographerFactory", ["$http", function ($http) {
    return {
        photographers : { list: [] },
        updatePhotographersList : function () {
            var self = this;
            $http({
                method: 'GET',
                url: '/photographerData'
            }).then(function (response) {
                console.log('Photographer factory received data from the server: ', response.data);
                self.photographers.list = response.data;
            }).catch(function (err) {
                console.error('Error retreiving photographer data: ', err);
            });
        }
    };
}]);