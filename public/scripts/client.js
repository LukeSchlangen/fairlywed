var app = angular.module("sampleApp", ["firebase", "ui.router"]);

app.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home');

    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'views/home.html'
        })
        .state('home.photographers', {
            url: '/photographers',
            templateUrl: 'views/photographers.html'
        })
        .state('home.photographers.search', {
        url: '/search?package&param1&param2',
        template: '<h1>new!!!!!!!!!!</h1>',
        controller: function($scope, $stateParams) {
            $scope.package = $stateParams.package;
            $scope.param1 = $stateParams.param1;
            $scope.param2 = $stateParams.param2;
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