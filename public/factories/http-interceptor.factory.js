app.config(function ($httpProvider) {
    $httpProvider.interceptors.push(function (AuthFactory) {
        return {
            'request': function (config) {
                var firebaseUser = AuthFactory.$getAuth();
                if (firebaseUser && config) {
                    return firebaseUser.getToken().then(function (idToken) {
                        if (!config.headers) {config.headers = {}}
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