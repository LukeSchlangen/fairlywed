app.factory("PhotographerFactory", ["$http",
    function ($http) {
        function getPhotographers() {
            return $http({
                method: 'GET',
                url: '/photographerData'
            }).then(function (response) {
                console.log('Photographer factory received data from the server: ', response.data);
                return response.data;
            }).catch(function(err){
                console.error('Error retreiving photographer data: ', err);
            });
        }

        return {
            getPhotographers: function() {
                return getPhotographers();
            }
        }
    }
]);