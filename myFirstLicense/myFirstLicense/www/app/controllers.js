(function () {
    "use strict";
    angular.module("myapp.controllers", [])

        .controller("appCtrl", ["$scope", "$ionicPopover", "$stateParams", function ($scope, $ionicPopover, $stateParams, $ionicSideMenuDelegate) {
            $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = true;
                $scope.$root.showSignUp = false;
            });
        }])

        .controller("signInCtrl", ["$scope", "$state", "LoginService", "$ionicPopup", '$q', function ($scope, $state, LoginService, $ionicPopup, $q) {
            $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = false;
                $scope.$root.showSignUp = true;


            });

            $scope.data = {};
            
            $scope.login = function (username, password) {
                var map = function (doc) {
                    if (doc.username) {
                        emit(doc._id, { username: doc.username, password: doc.password });
                    }
                }

                return localDB.query(map, { reduce: false }).then(function (result) {
                    var userExists = false;
                    result.rows.forEach(function (user) {
                        
                        if (user.value.username === username) {
                            userExists = true;
                            if (user.value.password !== password) {
                                var alertPopup = $ionicPopup.alert({
                                    title: 'Sign in failed!',
                                    template: 'Wrong Password'
                                });
                                return;
                            }
                            else {
                                $state.go('app', {user: username});
                            }
                        }                        
                    });
                    if (!userExists) {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Sign in failed!',
                                template: 'Username does not exist'
                            });
                            return;
                        }
                    // handle result
                }).catch(function (err) {
                });
            }



        }])

        .controller("signUpCtrl", ["$scope", "$state", "$ionicPopup", "$q", function ($scope, $state, $ionicPopup,$q) {
            $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = false;
                $scope.$root.showSignUp = false;
            });
            
            var checkUsers = function (username, password) {
                var defer = $q.defer();
                var foundUser = false;
                var map = function (doc) {
                    if (doc.username) {
                        emit(doc._id, { username: doc.username, password: doc.password });
                    }
                }

                localDB.query(map, { reduce: false }).then(function (result) {
                    result.rows.forEach(function (user) {

                        if (user.value.username === username) {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Sign up failed!',
                                template: 'Username already exists.'
                            });
                            foundUser = true;
                        }
                    })
                      if (foundUser === false)
                    defer.resolve(true);
                else
                    defer.reject();                                   
                }).catch(function (err) {
                });
              

                return defer.promise;
            }

            $scope.users = [];

            $scope.create = function (user) {
                if (user && user.username && user.password) {
                    if (user && user.username && user.password && user.username.length < 6 || user.password.length < 6) {
                        var text;
                        if (user.username.length < 6)
                            text = 'Please enter a username longer than 6 characters!';
                        else
                            text = 'Please enter a password longer than 6 characters!'
                        var alertPopup = $ionicPopup.alert({
                            title: 'Sign up failed!',
                            template: text
                        });
                        return;
                    }
                    else if (user.password !== user.retypePassword) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Sign up failed!',
                            template: 'Please enter the same password!'
                        });
                        return;
                    }
                }
                else
                    var alertPopup = $ionicPopup.alert({
                        title: 'Sign up failed!',
                        template: 'Please enter data into the fields!'
                    });
                if (user !== undefined) {
                    
                    if ($scope.hasOwnProperty("users") !== true) {
                        $scope.users = [];
                    }                    
                    checkUsers(user.username).then(function (){
                        var alertPopup = $ionicPopup.alert({
                                    title: 'Sign up completed!',
                                    template: 'User has been succesfully added.'
                                });
                    localDB.post({ username: user.username,
                                   password: user.password });
                                    $state.go('signIn');
                                    });
                } else {
                    console.log("Action not completed");
                }
            }
        }])

        .controller("weatherMainPageCtrl", ["$scope", "$state", "$http", function ($scope, $state, $http) {
            $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = true;
                $scope.$root.showSignUp = false;
            });

            var onSuccess = function (position) {
                getCity(position.coords.longitude, position.coords.latitude);
            };

            function onError(error) {
                $scope.weatherError = error;
            }

            navigator.geolocation.getCurrentPosition(onSuccess, onError);


            var getCity = function (longitude, latitude) {
                $http({
                    method: 'GET',
                    url: 'http://nominatim.openstreetmap.org/reverse?format=json&lat=' + latitude + '&lon=' + longitude
                }).then(function successCallback(response) {
                    $scope.cityName = response.data.address.city + ", " + response.data.address.country;
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
            }
        }])

        .controller("calendarMainPageCtrl", ["$scope", "$state", function ($scope, $state) {
            $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = true;
                $scope.$root.showSignUp = false;
            });
        }])

        .controller("newsMainPageCtrl", ["$scope", "$state", function ($scope, $state) {
            $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = true;
                $scope.$root.showSignUp = false;
            });
        }])

        .controller("financialManagerCtrl", ["$scope", "$state", function ($scope, $state) {
            $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = true;
                $scope.$root.showSignUp = false;
            });
        }])

    //errorCtrl managed the display of error messages bubbled up from other controllers, directives, myappService
        .controller("errorCtrl", ["$scope", "myappService", function ($scope, myappService) {
            //public properties that define the error message and if an error is present
            $scope.error = "";
            $scope.activeError = false;

            //function to dismiss an active error
            $scope.dismissError = function () {
                $scope.activeError = false;
            };

            //broadcast event to catch an error and display it in the error section
            $scope.$on("error", function (evt, val) {
                //set the error message and mark activeError to true
                $scope.error = val;
                $scope.activeError = true;

                //stop any waiting indicators (including scroll refreshes)
                myappService.wait(false);
                $scope.$broadcast("scroll.refreshComplete");

                //manually apply given the way this might bubble up async
                $scope.$apply();
            });
        }]);
})();