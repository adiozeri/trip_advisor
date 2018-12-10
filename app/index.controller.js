angular.module('appModule')
    .controller('IndexController', ['$location', function ($location) {
        let vm = this;
        vm.userConnected = false;
    }]);