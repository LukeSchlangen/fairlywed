var app = angular.module("sampleApp", ["firebase", "ui.router"]);

app.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home');

    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'views/home.html'
        })
        .state('home.photographers', {
            url: '/photographers?package&location&longitude&latitude',
            templateUrl: 'views/photographers.html',
            controller: function ($scope, $stateParams) {
                $scope.package = $stateParams.package;
                $scope.location = $stateParams.location;
                $scope.longitude = $stateParams.longitude;
                $scope.latitude = $stateParams.latitude;
                console.log('$stateParams: ', $stateParams);
            }
        })
        .state('home.videographers', {
            url: '/videographers',
            templateUrl: 'views/videographers.html'
        })
        .state('home.djs', {
            url: '/djs',
            templateUrl: 'views/djs.html'
        })
});