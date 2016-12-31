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
            templateUrl: 'views/photographers.html'
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