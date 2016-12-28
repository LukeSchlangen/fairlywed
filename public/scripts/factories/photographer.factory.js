app.factory("PhotographerFactory", ["$http", function ($http) {
    return {
        photographers : { list: [] },
        updatePhotographersList : function (searchObject) {
            var self = this;
            searchObject.vendorType = 'photographer'
            $http({
                method: 'GET',
                url: '/photographerData',
                params: { search: searchObject }
            }).then(function (response) {
                console.log('Photographer factory received data from the server: ', response.data);
                self.photographers.list = response.data;
            }).catch(function (err) {
                console.error('Error retreiving photographer data: ', err);
            });
        }
    };
}]);