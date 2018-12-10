angular.module('appModule').service('registeredUsersService', ['$http', function ($http) {
    let serverUrl = 'http://localhost:3000/reg/users/';
    this.getSavedAttractions = function (item) {
        return $http.get(serverUrl + 'savedAttractions/' + item);
    };
    this.recommendAttractions = function (item) {
        console.log($http.defaults.headers);
        return $http.get(serverUrl + 'recommendAttractions/' + item);
    };

}]).controller('registeredUsersController', ['setTokenService', 'localStorageModel', 'toastr', '$location', '$route', '$scope', '$routeParams', 'registeredUsersService', function (setTokenService, localStorageModel, toastr, $location, $route, $scope, $routeParams, registeredUsersService) {
    let vm = this;
    vm.isLoading = true;
    vm.savedAttractions = [];
    vm.savedAttractionsToShow = [];
    vm.recommendAttractionsArray = [];

    start();

    vm.addToFavorite = addToFavorite;
    vm.removeFromFavorite = removeFromFavorite;
    vm.openAttraction = openAttraction;
    vm.switchUser = switchUser;

//on init function
    function start() {
        vm.isLoading = true;
        vm.userName = $routeParams.userName;

        let token = localStorageModel.get('token');
        setTokenService.set(token);

        vm.savedAttractions = localStorageModel.get('savedAttractions');

        if (vm.savedAttractions != null && vm.savedAttractions !== undefined) {
            vm.savedAttractions.sort(function (a, b) {
                let dateA = new Date(a.Date), dateB = new Date(b.Date);
                return dateB - dateA
            });
            vm.savedAttractionsToShow = vm.savedAttractions.slice(0, 2);
        }

        registeredUsersService.recommendAttractions(vm.userName).then(function (response) {
            if (response.data != null && response.data.success !== false) {
                vm.recommendAttractionsArray = response.data;
                for (let i = 0; i < vm.recommendAttractionsArray.length; i++) {
                    vm.recommendAttractionsArray[i].Pictures_ID = JSON.parse(vm.recommendAttractionsArray[i].Pictures_ID)
                }

                if (vm.savedAttractions === null || vm.savedAttractions === undefined) {
                    registeredUsersService.getSavedAttractions(vm.userName).then(function (response) {
                        if (response.data != null) {
                            console.log(response.data);
                            vm.savedAttractions = response.data;
                            for (let i = 0; i < vm.savedAttractions.length; i++) {
                                vm.savedAttractions[i].Pictures_ID = JSON.parse(vm.savedAttractions[i].Pictures_ID)
                            }
                            vm.savedAttractions.sort(function (a, b) {
                                let dateA = new Date(a.Date), dateB = new Date(b.Date);
                                return dateB - dateA
                            });
                            for (let i = 0; i < vm.savedAttractions.length; i++) {
                                vm.savedAttractions[i].saved = true;
                            }
                            localStorageModel.add('savedAttractions', vm.savedAttractions);
                            vm.savedAttractionsToShow = vm.savedAttractions.slice(0, 2);

                            updateSavedAttractions();
                            vm.isLoading = false;
                        }
                    }, function () {
                        toastr.error('Failed to load data from server.');
                    });
                }
                else {
                    updateSavedAttractions();
                    vm.isLoading = false;
                }
            }
            else {
                toastr.error('Failed to load data from server.');
            }
        }, function (response) {
            toastr.error(response.data.error)
        });
    }

    function openAttraction(attraction) {
        $route.routes['/attraction/:id'].attraction = attraction;
        $location.path('/attraction/' + attraction.ID);
    }

    function switchUser() {
        localStorageModel.update('token', '');
        $location.path("/");
    }

    function addToFavorite(attraction) {
        attraction.saved = true;
        attraction.Date = new Date();
        if (vm.savedAttractions === null || vm.savedAttractions === undefined || vm.savedAttractions.length === 0) {
            attraction.Order_ID = 1;
            vm.savedAttractions = [];
        }
        else {
            vm.savedAttractions.sort(function (a, b) {
                return b.Order_ID - a.Order_ID;
            });
            attraction.Order_ID = vm.savedAttractions[0].Order_ID + 1;
        }
        vm.savedAttractions.push(attraction);
        attraction.saved = true;
        localStorageModel.update('savedAttractions', vm.savedAttractions);
        toastr.info('you have ' + vm.savedAttractions.length + ' attractions saved');
    }

    function removeFromFavorite(attraction) {
        vm.savedAttractions = vm.savedAttractions.filter(function (obj) {
            return obj.ID !== attraction.ID;
        });
        attraction.saved = false;
        localStorageModel.update('savedAttractions', vm.savedAttractions);
    }

    function updateSavedAttractions() {
        for (let i = 0; i < vm.recommendAttractionsArray.length; i++) {
            let attraction = vm.recommendAttractionsArray[i];
            let found = (vm.savedAttractions.some(function (value) {
                return value.ID === attraction.ID;
            }));
            if (found)
                vm.recommendAttractionsArray[i].saved = true;
            else
                vm.recommendAttractionsArray[i].saved = false;
        }
    }
}]);



