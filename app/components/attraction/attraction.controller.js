angular.module('appModule').service('attractionService', ['$http', function ($http) {
    let serverUrl = 'http://localhost:3000/reg/attractions/';
    this.getAttraction = function (item) {
        return $http.get(serverUrl + 'attraction/' + item);
    };
    this.updateRank = function (item) {
        return $http.post(serverUrl + 'updateRank/' + item.attraction_ID, item);
    };
    this.updateReview = function (item) {
        return $http.post(serverUrl + 'updateReview/' + item.attraction_ID, item);
    };
    this.increaseNumberOfViewers = function (item) {
        return $http.post(serverUrl + 'increaseNumberOfViewers/', item);
    };

}]).controller('attractionController', ['toastr', '$route', '$location', '$scope', '$routeParams', '$mdDialog', 'attractionService', 'setTokenService', 'localStorageModel', function (toastr, $route, $location, $scope, $routeParams, $mdDialog, attractionService, setTokenService, localStorageModel) {
    let vm = this;
    vm.isLoading = true;
    vm.userAlreadyRate = false;
    vm.updateRate = updateRate;
    vm.userRate = 5;

    start();

//on init function
    function start() {
        let token = localStorageModel.get('token');
        setTokenService.set(token);
        vm.attraction = $route.routes['/attraction/:id'].attraction;
        if (vm.attraction === undefined) {
            attractionService.getAttraction($routeParams.id).then(function (response) {
                console.log(response.data);
                vm.attraction = response.data[0];
                vm.attraction.Pictures_ID = JSON.parse(vm.attraction.Pictures_ID);
                if (vm.attraction.Reviews.length !== 0) {
                    vm.attraction.Reviews = JSON.parse(vm.attraction.Reviews);
                    vm.attraction.Reviews.sort(function (a, b) {
                        let dateA = new Date(a.Date), dateB = new Date(b.Date);
                        return dateB - dateA
                    });
                    vm.reviewsToShow = vm.attraction.Reviews.slice(0, 2);
                }
                attractionService.increaseNumberOfViewers(vm.attraction.ID);
                calculateRate();
                vm.isLoading = false;
            }, function (response) {
                // throw exception to user
            });
        }
        else {
            attractionService.increaseNumberOfViewers(vm.attraction.ID);
            if (vm.attraction.Reviews.length !== 0) {
                vm.attraction.Reviews = JSON.parse(vm.attraction.Reviews);
                vm.attraction.Reviews.sort(function (a, b) {
                    let dateA = new Date(a.Date), dateB = new Date(b.Date);
                    return dateB - dateA
                });
                vm.reviewsToShow = vm.attraction.Reviews.slice(0, 2);
            }
            calculateRate();
            vm.isLoading = false;
        }
    }

    vm.showAdvanced = function (ev) {
        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'components/attraction/addReviewDialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
        }).then(function (answer) {
            let newReview = {
                Date: new Date().toString(),
                Review: answer
            };
            if (vm.attraction.Reviews.length === 0)
                vm.attraction.Reviews = [];
            vm.attraction.Reviews.push(newReview);
            vm.updateReviewData = {
                attraction_ID: vm.attraction.ID,
                reviews: vm.attraction.Reviews
            };
            vm.attraction.Reviews.sort(function (a, b) {
                let dateA = new Date(a.Date), dateB = new Date(b.Date);
                return dateB - dateA
            });
            attractionService.updateReview(vm.updateReviewData).then(function () {
                vm.reviewsToShow = vm.attraction.Reviews.slice(0, 2);
                toastr.success('your review is added, thank you!')
            })

        });
    };

    vm.cancel = function () {
        $mdDialog.cancel();
    };

    function updateRate() {
        if (!vm.userAlreadyRate) {
            vm.userAlreadyRate = true;
            if (vm.attraction.Attraction_Rank !== 0) {
                vm.attraction.Attraction_Rank = vm.attraction.Attraction_Rank + vm.userRate;
            }
            else {
                vm.attraction.Attraction_Rank = vm.userRate;
            }
            vm.attraction.RankersCount = vm.attraction.RankersCount + 1;
            calculateRate();
            vm.updateRateData = {
                attraction_ID: vm.attraction.ID,
                rank: vm.attraction.Attraction_Rank,
                rankersCount: vm.attraction.RankersCount,
            };
            vm.savedAttractions = localStorageModel.get('savedAttractions');
            for (let i = 0; i < vm.savedAttractions.length; i++) {
                if (vm.savedAttractions[i].ID === vm.updateRateData.attraction_ID) {
                    vm.savedAttractions[i].Attraction_Rank = vm.updateRateData.rank;
                    vm.savedAttractions[i].RankersCount = vm.updateRateData.rankersCount;
                }
            }
            localStorageModel.update('savedAttractions', vm.savedAttractions);
            attractionService.updateRank(vm.updateRateData);
        }
    }

    function calculateRate() {
        if (vm.attraction.Attraction_Rank === 0) {
            vm.rateStar = 0;
            vm.ratePercentage = 0;
        }
        else {
            vm.rateStar = (vm.attraction.Attraction_Rank / vm.attraction.RankersCount);
            vm.ratePercentage = ((vm.attraction.Attraction_Rank / vm.attraction.RankersCount) * 20).toFixed(2);
        }
    }
}]);



