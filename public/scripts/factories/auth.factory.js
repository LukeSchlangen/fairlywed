app.factory("AuthFactory", function($firebaseAuth, $http) {
  var auth = $firebaseAuth();

  // This code runs whenever the user logs in
  var logIn = function(){
    return auth.$signInWithPopup("google").then(function(firebaseUser) {
      currentUser = firebaseUser;
      console.log("Firebase Authenticated as: ", firebaseUser.user.displayName);
    }).catch(function(error) {
      console.log("Authentication failed: ", error);
    });
  };

  // This code runs whenever the user changes authentication states
  // e.g. whevenever the user logs in or logs out
  // this is where we put most of our logic so that we don't duplicate
  // the same things in the login and the logout code
  auth.$onAuthStateChanged(function(firebaseUser){
    // firebaseUser will be null if not logged in
    currentUser = firebaseUser;
    if(firebaseUser) {
    //   // This is where we make our call to our server
    //   firebaseUser.getToken().then(function(idToken){
    //     $http({
    //       method: 'GET',
    //       url: '/privateData',
    //       headers: {
    //         id_token: idToken
    //       }
    //     }).then(function(response){
    //       self.secretData = response.data;
    //     });
    //   });
    } else {
      console.log('Not logged in or not authorized.');
      self.secretData = [];
    }

  });

  // This code runs when the user logs out
  var logOut = function(){
    currentUser = null;
    return auth.$signOut().then(function(){
      console.log('Logging the user out!');
    });
  };

  return {
      logOut: function(){
          return logOut();
      },
      logIn: function(){
          return logIn();
      },
      getCurrentUser: function(){
          return currentUser;
      },
      isLoggedIn: function(){
          return !!currentUser;
      }
  }
});
