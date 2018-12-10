angular.module('appModule').service('homePageService', ['$http', function ($http) {
    let serverUrl = 'http://localhost:3000/';
    this.login = function (item) {
        return $http.post(serverUrl + 'authenticate', item);
    };
    this.signUp = function (item) {
        return $http.post(serverUrl + 'signUp', item);
    };
    this.questionsRetrival = function (item) {
        return $http.get(serverUrl + 'questionsForAccountRetrieval/' + item);
    };
    this.randomTopAttraction = function () {
        return $http.get(serverUrl + 'randomTopAttraction');
    };
    this.getCategories = function () {
        return $http.get(serverUrl + "categories");
    };
    this.getPassword = function (item) {
        return $http.get(serverUrl + 'password/' + item);
    };

}]).controller('homePageController', ['toastr', '$location', '$scope', 'homePageService', 'setTokenService', 'localStorageModel', '$mdDialog', function (toastr, $location, $scope, homePageService, setTokenService, localStorageModel, $mdDialog) {
    let vm = this;
    vm.getAllDone = false;
    vm.user = undefined;
    vm.userLogin = undefined;
    vm.XmlCountries = undefined;
    vm.countries = undefined;
    vm.attractions = undefined;
    vm.userQuestions = undefined;
    vm.insertUserName = false;
    vm.passwordReterive = undefined;
    vm.getAllAttractionDone = false;

    vm.loadXMLDoc = loadXMLDoc;
    vm.login = login;
    vm.signUp = signUp;
    vm.forgetPassword = forgetPassword;
    vm.retrievePassword = retrievePassword;

    start();

//on init function
    function start() {
        $scope.$parent.vm.userConnected = false;
        vm.getAllDone = false;
        vm.getAllAttractionDone = false;
        if ($location.path() === '/signUp') {
            vm.user = getUserEmptyJson();
            loadXMLDoc();
            loadCategories();
        }
        else {
            var token;
            if (token = localStorageModel.get('token')) {
                setTokenService.set(token);
                vm.username = localStorageModel.get('userName');
                $scope.$parent.vm.userConnected = true;
                $location.path("/user/" + vm.username);
            }
            loadRandomAttractions();
        }
    }

    function loadCategories() {
        homePageService.getCategories().then(function (response) {
            vm.categories = response.data;
            vm.getAllDone = true;
        }, function (response) {
            toastr.error('Failed to load data from server.');
            console.log(response);
        });
    }

    function getUserEmptyJson() {
        return {
            username: '',
            password: '',
            firstname: '',
            lastname: '',
            city: '',
            country: '',
            email: '',
            questionsAndAnswersForRetrive: [
                {
                    question: '',
                    answer: ''
                },
                {
                    question: '',
                    answer: ''
                }
            ],
            categories: []
        }
    }

    function signUp() {
        if (vm.signUpForm.$valid) {
            if (vm.user.categories.length > 1) {
                homePageService.signUp(vm.user)
                    .then(function () {
                        toastr.success('thank you for your friendship, enjoy!');
                        $location.path('/')
                    }, function (response) {
                        toastr.error('something went wrong, please try again.');
                        console.log(response);
                    });
            }
            else {
                toastr.error('You must choose at least 2 favorite categories');
            }
        }
        else {
            toastr.error('Can\'t save details, data is not valid');
        }
    }

    function loadRandomAttractions() {
        homePageService.randomTopAttraction().then(function (response) {
            vm.attractions = response.data;
            vm.attractions.forEach(function (value) {
                value.Pictures_ID = JSON.parse(value.Pictures_ID)
            });
            vm.getAllAttractionDone = true;
        }, function (response) {
            toastr.error('Failed to load data from server.');
            console.log(response);
        });
    }

    function login() {
        homePageService.login(vm.userLogin)
            .then(function (response) {
                if (response.data.success) {
                    setTokenService.set(response.data.token);
                    localStorageModel.update('token', response.data.token);
                    localStorageModel.update('userName', vm.userLogin.username);
                    localStorageModel.update('password', vm.userLogin.password);
                    $scope.$parent.vm.userConnected = true;
                    $location.path("/user/" + vm.userLogin.username);
                }
                else {
                    toastr.error('user or password incorrect.');
                }
            }, function (response) {
                toastr.error('Failed to load data from server.');
                console.log(response);
            });
    }

    function forgetPassword(userName) {
        homePageService.questionsRetrival(userName).then(function (response) {
            vm.userQuestions = response.data;
            vm.insertUserName = true;
        }, function (response) {
            toastr.error('Sorry, we failed to retrieve your questions.')
            console.log(response);
        });
    }

    function retrievePassword(userName, event) {
        if (vm.firstAnswer === vm.userQuestions[0].Answer &&
            vm.secondAnswer === vm.userQuestions[1].Answer) {

            homePageService.getPassword(userName).then(function (response) {
                vm.passwordReterive = response.data;
                $scope.showPassword(event)
            }, function (response) {
                toastr.error('Sorry, we failed to retrieve your password.');
                console.log(response);
            });

        }
        else {
            toastr.error('one or more of your answers are incorrect')
        }
    }

    $scope.showPassword = function (ev) {
        var confirm = $mdDialog.confirm()
            .title('Your Password')
            .textContent(vm.passwordReterive[0].password)
            .targetEvent(ev)
            .ok('o.k')

        $mdDialog.show(confirm).then(function () {
            $location.path('/')
        }, function () {
        });
    };

    function loadXMLDoc() {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                myFunction(this);
            }
        };
        xmlhttp.open("GET", "assets/countries.xml", true);
        xmlhttp.send();
    }

    function myFunction(xml) {
        var i;
        var xmlDoc = xml.responseXML;
        var temp = [];
        var x = xmlDoc.getElementsByTagName("Country");
        for (i = 0; i < x.length; i++) {
            var json = {
                "ID": x[i].getElementsByTagName("ID")[0].childNodes[0].nodeValue.toString(),
                "Name": x[i].getElementsByTagName("Name")[0].childNodes[0].nodeValue.toString()
            }
            temp.push(json);
        }
        vm.XmlCountries = temp;
    }
}]);



