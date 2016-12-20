var app = angular.module("app", ["firebase"]);

app.controller("AuthController", ["AuthFactory", function(AuthFactory){
  var self = this;

  self.logIn = function(){
    AuthFactory.logIn().then(function(){
    self.currentUser = AuthFactory.getCurrentUser();
    self.isLoggedIn = AuthFactory.isLoggedIn();
  });;

  } 
  self.logOut = function(){
  AuthFactory.logOut().then(function(){
    self.currentUser = AuthFactory.getCurrentUser();
    self.isLoggedIn = AuthFactory.isLoggedIn();
  });

  }
}]);