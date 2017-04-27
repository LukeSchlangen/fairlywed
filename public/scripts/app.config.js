app.config(function ($stateProvider, $urlRouterProvider, $mdThemingProvider, StripeCheckoutProvider) {

    StripeCheckoutProvider.defaults(stripeConfig);

    $urlRouterProvider.otherwise(function ($injector) {

        var $state = $injector.get('$state');

        $state.go('404', null, {
            location: false
        });

    });

    $urlRouterProvider.when('', '/home/photographers');
    $urlRouterProvider.when('/account', '/account/vendor');
    $urlRouterProvider.when('/photographers/:subvendorId', '/photographers/:subvendorId/about');
    $urlRouterProvider.when('/account/vendor/details/:vendorId/subvendor/details/:subvendorId', '/account/vendor/details/:vendorId/subvendor/details/:subvendorId/about');

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
            url: '/photographers/:subvendorId?package&location&longitude&latitude&date',
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
        .state('photographers.booking', {
            url: '/booking',
            templateUrl: 'views/photographers/booking.html'
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
            url: '/details/:vendorId?state&scope&code',
            templateUrl: 'views/account/vendor-details.html',
            onEnter: function ($state, $stateParams) {
                if (!$stateParams.vendorId) {
                    $state.transitionTo('account.vendor');
                }
            }
        })
        .state('account.vendor.details.subvendor', {
            url: '/subvendor',
            template: '<div ui-view></div>'
        })
        .state('account.vendor.details.subvendor.details', {
            url: '/details/:subvendorId',
            templateUrl: 'views/account/subvendor-details/subvendor-details.html',
            onEnter: function ($state, $stateParams) {
                if (!$stateParams.subvendorId) {
                    $state.transitionTo('account.vendor.details', { vendorId: $stateParams.vendorId });
                }
            }
        })
        .state('account.vendor.details.subvendor.details.about', {
            url: '/about',
            templateUrl: 'views/account/subvendor-details/about.html'
        })
        .state('account.vendor.details.subvendor.details.availability', {
            url: '/availability',
            templateUrl: 'views/account/subvendor-details/availability.html'
        })
        .state('account.vendor.details.subvendor.details.images', {
            url: '/images',
            templateUrl: 'views/account/subvendor-details/images.html'
        })
        .state('account.vendor.details.subvendor.details.packages', {
            url: '/packages',
            templateUrl: 'views/account/subvendor-details/packages.html'
        })
        .state('matchmaker', {
            url: '/matchmaker',
            templateUrl: 'views/matchmaker.html'
        })
        .state('404', {
            template: 'That is a 404'
        });


    // Configuring color theme
    $mdThemingProvider.definePalette('black', {
        '50': '000000',
        '100': '000000',
        '200': '000000',
        '300': '000000',
        '400': '000000',
        '500': '000000',
        '600': '000000',
        '700': '000000',
        '800': '000000',
        '900': '000000',
        'A100': '000000',
        'A200': '000000',
        'A400': '000000',
        'A700': '000000',
        'contrastDefaultColor': 'light'
    });
    $mdThemingProvider.definePalette('white', {
        '50': 'ffffff', // main background for everything
        '100': 'ffffff',
        '200': 'eeeeee', // dropdown highlighted option background
        '300': 'eeeeee', // calendar header (days of week) background and calendar date hover color
        '400': 'ffffff',
        '500': 'aaaaaa', // button hover background
        '600': 'ffffff',
        '700': 'ffffff',
        '800': 'ffffff',
        '900': '000000', // Text in the dropdown list
        'A100': 'ffffff', // No clue
        'A200': '000000', // Non selected day text in the calendar toggle
        'A400': 'ffffff', // No clue
        'A700': 'ffffff', // No clue
        'contrastDefaultColor': 'dark'
    });

    $mdThemingProvider.theme('default')
        .primaryPalette('black')
        .accentPalette('black')
    // .backgroundPalette('white');
});
