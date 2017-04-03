app.config(function ($httpProvider) {
    $httpProvider.interceptors.push(function (AuthFactory) {
        return {
            'request': function (config) {
                var firebaseUser = AuthFactory.$getAuth();
                console.log('Http Interceptor running');
                if (firebaseUser && config) {
                    return firebaseUser.getToken().then(function (idToken) {
                        config.headers.id_token = idToken;
                        return config;
                    });
                } else {
                    return config;
                }
            }
        }
    });
});