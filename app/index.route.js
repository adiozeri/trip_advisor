// angular.module('homeModule', [] );
// angular.module('registeredUsersModule', [] );
let app = angular.module('appModule', ['toastr',"ngRoute", 'ngMaterial', 'ngMessages','star-rating','ngAnimate', 'ngTouch','md.chips.select','LocalStorageModule']);

app.config(['$locationProvider','toastrConfig', '$routeProvider', function ($locationProvider,toastrConfig, $routeProvider) {


    $locationProvider.hashPrefix('');
    // attraction

    $routeProvider
        .when('/', {
            templateUrl: 'components/homePage/login.html',
            controller: 'homePageController as vm'
        }).when('/signUp', {
        templateUrl: 'components/homePage/register.html',
        controller: 'homePageController as vm'
    }).when('/forgetPassword', {
        templateUrl: 'components/homePage/forgetPassword.html',
        controller: 'homePageController as vm'
    }).when('/user/:userName', {
        templateUrl: 'components/registeredUsers/registeredUsers.html',
        controller: 'registeredUsersController as vm'
    }).when('/attractions', {
        templateUrl: 'components/attractions/attractions.html',
        controller: 'attractionsController as vm'
    }).when('/about', {
        templateUrl: 'components/about/about.html',
        controller : 'aboutController as vm',
    }).when('/favorites', {
        templateUrl: 'components/favorite/favorite.html',
        controller : 'favoriteController as vm',
    }).when('/attraction/:id', {
        templateUrl: 'components/attraction/attraction.html',
        controller : 'attractionController as vm',
    }).otherwise({redirectTo: '/'});

    angular.extend(toastrConfig, {
        autoDismiss: false,
        containerId: 'toast-container',
        maxOpened: 0,
        newestOnTop: true,
        positionClass:'toast-bottom-right' ,
        preventDuplicates: true,
        preventOpenDuplicates: false,
        progressBar: true,
        target: 'body',
        closeButton: true,

    });

}]);

