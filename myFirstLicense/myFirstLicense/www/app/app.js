(function () {
    "use strict";

    angular.module("myapp", ["ionic", "myapp.controllers", "myapp.services"])
        .run(function ($ionicPlatform) {
            $ionicPlatform.ready(function () {
                if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }
            });
        })
        .config(function ($stateProvider, $urlRouterProvider) {
            $stateProvider

                .state("app", {
                    url: "/app",
                    templateUrl: "app/menu/menuPage.html",
                    controller: "appCtrl",
                    params: { id:null }
                })
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