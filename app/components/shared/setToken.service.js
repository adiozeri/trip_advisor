angular.module("appModule")
    .service('setTokenService', ['$http' ,function ($http) {
        this.set = function (token) {
            $http.defaults.headers.common['x-access-token'] = token;
        }
    }]);