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
                controller: "appCtrl"
            })            
            .state("weather", {
                url: "/weather",
                cache: false,
                templateUrl: "app/weather/weatherMainPage.html",
                controller: "weatherMainPageCtrl"
            })
            .state("calendar", {
                url: "/calendar",
                cache: false,
                templateUrl: "app/calendar/calendarMainPage.html",
                controller: "calendarMainPageCtrl"
            })
            .state("news", {
                url: "/news",
                cache: false,
                templateUrl: "app/news/newsMainPage.html",
                controller: "newsMainPageCtrl"
            })
            .state("financialManager", {
                url: "/financialManager",
                cache: false,
                templateUrl: "app/financialManager/financialManagerPage.html",
                controller: "financialManagerCtrl"
            })
            $urlRouterProvider.otherwise("app");
        });
})();