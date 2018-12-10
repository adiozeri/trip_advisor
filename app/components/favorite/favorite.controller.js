angular.module('appModule').service('favoriteService', ['$http', function ($http) {
    let serverUrl = 'http://localhost:3000/reg/users/';
    this.saveAttractionsToDB = function (item) {
        return $http.post(serverUrl + 'saveAttractionsToDB/' + item[0].UserName, item);
    };

}]).controller('favoriteController', ['favoriteService', 'registeredUsersService', '$mdSidenav', '$mdToast', 'setTokenService', 'localStorageModel', '$location', '$route', 'attractionsService', '$scope', 'toastr', function (favoriteService, registeredUsersService, $mdSidenav, $mdToast, setTokenService, localStorageModel, $location, $route, attractionsService, $scope, toastr) {
    let vm = this;

    vm.savedAttractions = [];
    vm.orderBy = undefined;
    vm.newIndex = undefined;
    vm.savedAttractionsSlide = [];
    vm.attractionsToShow = [];
    vm.isLoading = true;
    vm.searchAttraction = undefined;

    vm.filterByCategory = filterByCategory;
    vm.moveUp = moveUp;
    vm.moveDown = moveDown;
    vm.moveUp = moveUp;
    vm.sortAttractions = sortAttractions;
    vm.openAttraction = openAttraction;
    vm.removeFromFavorite = removeFromFavorite;
    vm.filterByAttraction = filterByAttraction;
    vm.savedAttractionsToDB = savedAttractionsToDB;
    $scope.toggleSidenav = openOrderChange('changeOrderSlide');

//on init function
    start();

    function start() {
        vm.isLoading = true;
        vm.savedAttractions = localStorageModel.get('savedAttractions');
        setTokenService.set(localStorageModel.get('token'));
        if (vm.savedAttractions === null) {
            registeredUsersService.savedAttraction(vm.userName).then(function (response) {
                vm.savedAttraction = response.data;
                vm.savedAttraction.forEach(function (value) {
                    value.Pictures_ID = JSON.parse(value.Pictures_ID)
                });
                vm.savedAttraction.forEach(
                    function (attraction) {
                        attraction.saved = true;
                    }
                );
                localStorageModel.add('savedAttractions', vm.savedAttraction);
                vm.attractionsToShow = vm.savedAttractions;
                vm.savedAttractionsSlide = vm.savedAttractions;
                $scope.radiosButtons = 'all';
                sortSlideAttractions('My Order');
                vm.isLoading = false;
            }, function (response) {
                console.log(response.data.error)
            });
        }
        else {
            vm.attractionsToShow = vm.savedAttractions;
            vm.savedAttractionsSlide = vm.savedAttractions;
            $scope.radiosButtons = 'all';
            sortSlideAttractions('My Order');
            vm.isLoading = false;
        }
    }

    function openOrderChange(id) {
        vm.savedAttractionsSlide = vm.savedAttractions;
        sortSlideAttractions();
        return function () {
            $mdSidenav(id).toggle();
        };
    }

    function moveUp(attraction) {
        let order = attraction.Order_ID;
        vm.savedAttractions.forEach(function (value) {
            if (value.Order_ID === order - 1) {
                value.Order_ID = order;
                attraction.Order_ID = order - 1;
            }
        });
        vm.savedAttractionsSlide = vm.savedAttractions;
        sortSlideAttractions();
        localStorageModel.update('savedAttractions', vm.savedAttractions);

    }

    function moveDown(attraction) {
        let order = attraction.Order_ID;
        vm.savedAttractions.forEach(function (value) {
            if (value.Order_ID === order + 1) {
                value.Order_ID = order;
                attraction.Order_ID = order + 1;
            }
        });
        vm.savedAttractionsSlide = vm.savedAttractions;
        sortSlideAttractions();
        localStorageModel.update('savedAttractions', vm.savedAttractions);
    }

    function filterByCategory(category) {
        vm.attractionsToShow = undefined;
        if (category === 'all')
            vm.attractionsToShow = vm.savedAttractions;
        else
            vm.attractionsToShow = vm.savedAttractions.filter(attraction => attraction.Category_ID === category);
    }

    function sortAttractions() {
        if (vm.orderBy === 'Rank') {
            vm.attractionsToShow = vm.savedAttractions;
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
        else if (vm.orderBy === 'My Order') {
            vm.attractionsToShow = vm.savedAttractions;
            vm.attractionsToShow.sort(function (a, b) {
                return a.Order_ID - b.Order_ID;
            });
        }
    }

    function sortSlideAttractions() {
        vm.savedAttractionsSlide.sort(function (a, b) {
            return a.Order_ID - b.Order_ID;
        });
    }

    function openAttraction(attraction) {
        $route.routes['/attraction/:id'].attraction = attraction;
        $location.path('/attraction/' + attraction.ID);
    }

    function removeFromFavorite(attraction) {
        vm.savedAttractions = vm.savedAttractions.filter(function (obj) {
            return obj.ID !== attraction.ID;
        });
        attraction.saved = false;
        localStorageModel.update('savedAttractions', vm.savedAttractions);
        vm.attractionsToShow = vm.savedAttractions;
    }

    function filterByAttraction() {
        vm.attractionsToShow = undefined;
        vm.attractionsToShow = vm.savedAttractions.filter(attraction => attraction.Name === vm.searchAttraction.Name);
    }

    function savedAttractionsToDB() {
        vm.dataToSave = [];
        let userName = localStorageModel.get('userName');
        for (let i = 0; i < vm.savedAttractions.length; i++) {
            vm.dataToSave.push(
                {
                    UserName: userName,
                    Attraction_ID: vm.savedAttractions[i].ID,
                    Order_ID: vm.savedAttractions[i].Order_ID,
                    Date: vm.savedAttractions[i].Date
                }
            )
        }
        favoriteService.saveAttractionsToDB(vm.dataToSave).then(function (response) {
            if (response.data.success)
                toastr.success('your favorite attractions are saved and available from any computer!')
            else
                toastr.error('something got wrong, please try again')

        })
    }
}]);



