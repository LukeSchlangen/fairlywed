app.controller("AuthController", ["$scope", "Auth",
    function ($scope, Auth) {
        $scope.auth = Auth;

        // any time auth state changes, add the user data to scope
        $scope.auth.$onAuthStateChanged(function (firebaseUser) {
            $scope.firebaseUser = firebaseUser;
        });
    }
]);