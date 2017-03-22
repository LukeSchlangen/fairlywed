app.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise(function ($injector) {

        var $state = $injector.get('$state');

        $state.go('404', null, {
            location: false
        });

    });

    $urlRouterProvider.when('', '/home/photographers');
    $urlRouterProvider.when('/photographers/:subvendorId', '/photographers/:subvendorId/about');

    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'views/home/home.html'
        })
        .state('home.photographers', {
            url: '/photographers?package&location&longitude&latitude&date',
            templateUrl: 'views/home/photographers.html'
        })
        .state('photographers', {
            url: '/photographers/:subvendorId',
            templateUrl: 'views/photographers/home.html',
            abstract: true
        })
        .state('photographers.about', {
            url: '/about',
            templateUrl: 'views/photographers/about.html'
        })
        .state('photographers.gallery', {
            url: '/gallery',
            templateUrl: 'views/photographers/gallery.html'
        })
        .state('photographers.book', {
            url: '/book',
            templateUrl: 'views/photographers/book.html'
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
            url: '/details/:vendorId',
            templateUrl: 'views/account/vendor-details.html'
        })
        .state('account.vendor.details.subvendor', {
            url: '/subvendor',
            template: '<div ui-view></div>'
        })
        .state('account.vendor.details.subvendor.details', {
            url: '/details/:subvendorId',
            templateUrl: 'views/account/subvendor-details.html'
        })
        .state('404', {
            template: 'That is a 404'
        })
});