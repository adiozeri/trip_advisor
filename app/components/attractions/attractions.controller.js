angular.module('appModule').service('attractionsService', ['$http', function ($http) {
    let serverUrl = 'http://localhost:3000/reg/attractions/';
    this.allAttractions = function () {
        return $http.get(serverUrl + 'getAllAttractions');
    };


}]).controller('attractionsController', ['$mdToast', 'setTokenService', 'localStorageModel', '$location', '$route', 'attractionsService', '$scope', 'toastr', function ($mdToast, setTokenService, localStorageModel, $location, $route, attractionsService, $scope, toastr) {
    let vm = this;
    vm.getAllAttractionDone = false;
    vm.allAttractions = undefined;
    vm.attractionsToShow = undefined;
    vm.savedAttractions = [];
    vm.searchAttraction = undefined;
    vm.searchText = undefined;
    vm.orderBy = undefined;

    vm.filterByAttraction = filterByAttraction;
    vm.filterByCategory = filterByCategory;
    vm.openAttraction = openAttraction;
    vm.addToFavorite = addToFavorite;
    vm.removeFromFavorite = removeFromFavorite;
    vm.selectOrder = selectOrder;

//on init function
    start();

    function start() {
        let token = localStorageModel.get('token');
        setTokenService.set(token);
        vm.savedAttractions = localStorageModel.get('savedAttractions');
        vm.getAllAttractionDone = false;
        allAttractions();
        $scope.radiosButtons = 'all';
    }

    function filterByCategory(category) {
        vm.attractionsToShow = undefined;
        if (category === 'all')
            vm.attractionsToShow = vm.allAttractions;
        else
            vm.attractionsToShow = vm.allAttractions.filter(attraction => attraction.Category_ID === category);
    }

    function selectOrder() {
        vm.attractionsToShow = vm.allAttractions;
        vm.attractionsToShow.sort(function (a, b) {
            if (b.RankersCount === 0 && a.RankersCount === 0) {
                return 0;
            }
            else if (b.RankersCount === 0) {
                return 0 - (a.Attraction_Rank / a.RankersCount);
            }
            else if (a.RankersCount === 0) {
                return (b.Attraction_Rank / b.RankersCount) - (0);
            }
            return (b.Attraction_Rank / b.RankersCount) - (a.Attraction_Rank / a.RankersCount);
        });
    }

    function openAttraction(attraction) {
        $route.routes['/attraction/:id'].attraction = attraction;
        $location.path('/attraction/' + attraction.ID);
    }

    function allAttractions() {
        attractionsService.allAttractions(vm.userName)
            .then(function (response) {
                console.log(response.data);
                vm.allAttractions = response.data;
                for (let i = 0; i < vm.allAttractions.length; i++) {
                    vm.allAttractions[i].Pictures_ID = JSON.parse(vm.allAttractions[i].Pictures_ID)
                }
                updateSavedAttractions();
                vm.attractionsToShow = vm.allAttractions;
                vm.getAllAttractionDone = true;
            }, function (response) {
                console.log(response.data.error)
            });
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
        for (let i = 0; i < vm.allAttractions.length; i++) {
            let attraction = vm.allAttractions[i];
            let found = (vm.savedAttractions.some(function (value) {
                return value.ID === attraction.ID;
            }));
            if (found)
                vm.allAttractions[i].saved = true;
            else
                vm.allAttractions[i].saved = false;
        }
    }

    function filterByAttraction() {
        vm.attractionsToShow = undefined;
        if (vm.searchText.length === 0) {
            vm.attractionsToShow = vm.allAttractions;
        }
        else {
            vm.attractionsToShow = vm.allAttractions.filter(attraction => attraction.Name === vm.searchText);
        }
    }
}]);



