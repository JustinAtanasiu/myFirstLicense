(function () {
    "use strict";

    angular.module("myapp", ["ionic", "myapp.controllers", "myapp.services", "ngCordova"])
        .run(function ($ionicPlatform, $cordovaDevice, $timeout, $rootScope) {
            $ionicPlatform.ready(function () {
                if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }
                // if (device !== undefined && device !== null)
                //     if (device.platform === "iOS") {
                //         window.plugin.notification.local.promptForPermission();
                //     }
                window.plugin.notification.local.onadd = function (id, state, json) {
                    var notification = {
                        id: id,
                        state: state,
                        json: json
                    };
                    $timeout(function () {
                        $rootScope.$broadcast("$cordovaLocalNotification:added", notification);
                    });
                };
            });
        })
        .config(function ($stateProvider, $urlRouterProvider) {
            $stateProvider
            
                .state("signIn", {
                    url: "/signIn",
                    cache: false,
                    templateUrl: "app/signIn/signIn.html",
                    controller: "signInCtrl"
                })
                .state("signUp", {
                    url: "/signUp",
                    cache: false,
                    templateUrl: "app/signUp/signUp.html",
                    controller: "signUpCtrl"
                })
                .state("weather", {
                    url: "/weather",
                    cache: false,
                    templateUrl: "app/weather/weatherMainPage.html",
                    controller: "weatherMainPageCtrl",
                    params: { id:null }
                })
                .state("calendar", {
                    url: "/calendar",
                    cache: false,
                    templateUrl: "app/calendar/calendarMainPage.html",
                    controller: "calendarMainPageCtrl",
                    params: { id:null }
                })
                .state("news", {
                    url: "/news",
                    cache: false,
                    templateUrl: "app/news/newsMainPage.html",
                    controller: "newsMainPageCtrl",
                    params: { id:null }
                })
                .state("financialManager", {
                    url: "/financialManager",
                    cache: false,
                    templateUrl: "app/financialManager/financialManagerPage.html",
                    controller: "financialManagerCtrl",
                    params: { id:null }
                })
            $urlRouterProvider.otherwise("signIn");
        });
})();