app.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home/photographers');

    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'views/home/home.html'
        })
        .state('home.photographers', {
            url: '/photographers?package&location&longitude&latitude&date',
            templateUrl: 'views/home/photographers.html'
        })
        .state('home.videographers', {
            url: '/videographers',
            templateUrl: 'views/home/videographers.html'
        })
        .state('home.djs', {
            url: '/djs',
            templateUrl: 'views/home/djs.html'
        })
        .state('account', {
            url: '/account',
            templateUrl: 'views/account/account.html'
        })
        .state('account.client', {
            url: '/client',
            templateUrl: 'views/account/client.html'
        })
        .state('account.vendor', {
            url: '/vendor',
            templateUrl: 'views/account/vendor.html'
        })
        .state('account.vendor.details', {
            url: '/vendor/details/:id',
            templateUrl: 'views/account/vendor-details.html'
        })
});