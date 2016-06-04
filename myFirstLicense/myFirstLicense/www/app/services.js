﻿(function () {
    "use strict";

    angular.module("myapp.services", []).factory("myappService", ["$rootScope", "$http", "$q", function ($rootScope, $http, $q) {
        var myappService = {};
        //starts and stops the application waiting indicator
        myappService.wait = function (show) {
            if (show)
                $(".spinner").show();
            else
                $(".spinner").hide();
        };
       
        return myappService;
    }])    
    
        .service('dbService', ["$state", "$ionicPopup", "$q", "md5", "$http", function ($state, $ionicPopup, $q, md5, $http) {
            var dbService = {};
            var userLog = {
                name: 'AdminJustin',
                password: 'Justin11AdminPassword'
            };

            var pouchOpts = {
                ajax: {
                    skipSetup: true,
                    withCredentials: false,
                }
            };

            var ajaxOpts = {
                ajax: {
                    headers: {
                        Authorization: 'Basic ' + window.btoa(userLog.name + ':' + userLog.password),
                    }
                }
            };
            var localServer = "localhost:8080";
            var localDB = new PouchDB('http://localhost:5984/personalassistant');
            // localDB.login(userLog.name, userLog.password, ajaxOpts).then(function(){
            dbService.get = function (id) {
                var defer = $q.defer();
                $http({
                    url: 'http://localhost:8080/api/getInfo/'+id,
                    method: "GET",
                    headers: {
                        'x-access-token': localStorage.token
                    }
                }).then(function (result) {
                    defer.resolve(result.data);
                });
                return defer.promise;
            }
            dbService.put = function(result, id, rev){
                var defer = $q.defer();
                $http({
                    url: 'http://localhost:8080/api/saveInfo/' + id,
                    method: "POST",
                    data: result,
                    headers: {
                        'x-access-token': localStorage.token
                    }
                }).then(function (result) {
                    defer.resolve(result.data);
                });
                return defer.promise;
            }
            
            dbService.create = function(user){
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
                                      
                    checkUsers(user.username).then(function () {

                        var resetDay = new Date();
                        var resetMonth = new Date();

                        var userpassword = md5.createHash(user.password || '');
                        var userusername = user.username.hashCode().toString();
                        var data = {username: userusername,
                                    password: userpassword,
                                    weatherLocations: [],
                                    financialInformation: {monthlyIncome: 0,
                                        monthlySpendings: 0,
                                        todaySpendings: 0,
                                        dayOfTheMonth: 1,
                                        totalSpendingsMonth: 0,
                                        resetDay: resetDay,
                                        resetMonth: resetMonth,
                                        monthlyTransactions: []
                                    },
                                    alarmTimes: [],
                                    notesList: []                            
                    }
                    $http.post('http://localhost:8080/api/signUp', data).then(function successCallback(response) {
                        var alertPopup = $ionicPopup.alert({
                                    title: 'Sign up completed!',
                                    template: 'User has been succesfully added.'
                                });
                    $state.go('signIn');
                    }, function errorCallback(response) {

                    });
                    });
                } else {
                    console.log("Action not completed");
                }
            }
            
            var checkUsers = function (username) {
                var userusername = username.hashCode().toString();
                var defer = $q.defer();
                $http.post('http://localhost:8080/api/checkUsers', { username: userusername }).then(function successCallback(response) {
                    if (response.data.status === 400) {
                        defer.reject();
                        var alertPopup = $ionicPopup.alert({
                            title: 'Sign up failed!',
                            template: 'Username already exists.'
                        });
                    }
                    defer.resolve(true);
                }, function errorCallback(response) {

                });

                return defer.promise;
            }
            String.prototype.hashCode = function () {
                var hash = 0, i, chr, len;
                if (this.length === 0) return hash;
                for (i = 0, len = this.length; i < len; i++) {
                    chr = this.charCodeAt(i);
                    hash = ((hash << 5) - hash) + chr;
                    hash |= 0; // Convert to 32bit integer
                }
                return hash;
            };
            
            dbService.login = function (username, password) {

                $http({
                    url: 'http://localhost:8080/api/authenticate',
                    method: "POST",
                    data: { username: username.hashCode().toString(), password: md5.createHash(password || '') }
                }).then(function (result) {
                    if (!result.data.success) {
                        if (result.data.status === 404) {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Sign in failed!',
                                template: 'Username does not exist'
                            });
                        }
                        else if (result.data.status === 503) {
                            var alertPopup = $ionicPopup.alert({
                                title: 'We are sorry!',
                                template: 'Something went wrong, please try again later.'
                            });
                        }
                    }
                    else {
                        localStorage.token = result.data.token;
                        $state.go('news', { id: result.data.id });
                    }                              
                            
                    // handle result
                }).catch(function (err) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'We are sorry!',
                        template: 'Something went wrong, please try again later.'
                    });
                    return;
                });
            };
            return dbService;
        }]).directive('logOut', function () {
            return {
                link: function ($scope, element) {
                    element.on('click', function () {
                        localStorage.clear();
                    });
                }
            }
        });
})();