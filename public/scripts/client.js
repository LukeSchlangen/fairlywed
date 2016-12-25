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
.state('home.photographers.new-qs', {
  url: 'home/new?portfolioId&param1&param2',
  template: '<h1>new!!!!!!!!!!</h1>',
  controller: function($scope, $stateParams) {
     $scope.portfolioId = $stateParams.portfolioId;
     $scope.param1 = $stateParams.param1;
     $scope.param2 = $stateParams.param2;
  }
})
//         state('new-qs', {
//   url: '/new?portfolioId',
//   templateUrl: 'new.html',
//   controller: function($scope, $stateParams) {
//      $scope.portfolioId = $stateParams.portfolioId;
//   }
// })
        .state('home.videographers', {
            url: '/videographers',
            templateUrl: 'views/videographers.html'
        })
        .state('home.djs', {
            url: '/djs',
            templateUrl: 'views/djs.html'
        })
});