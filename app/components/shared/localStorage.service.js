angular.module("appModule")
    .service('localStorageModel', ['localStorageService', function (localStorageService) {
        this.add = function (key, value) {
            let dataVal = localStorageService.get(key);
            console.log(dataVal);
            if (!dataVal)
                if (localStorageService.set(key, value))
                    console.log("data added");
                else
                    console.log('failed to add the data');
        };

        this.get = function (key) {
            return localStorageService.get(key);
        };

        this.update = function (key, value) {
            localStorageService.remove(key);
            localStorageService.set(key, value);
        };

    }]);