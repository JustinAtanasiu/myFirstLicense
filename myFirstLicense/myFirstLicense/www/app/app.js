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
            .state("app.home", {
                url: "/home",
                templateUrl: "app/menu/menuPage.html",
                controller: "appCtrl"
            })
            .state("app", {
                url: "/app",
                abstract: true,
                templateUrl: "app/weather/weatherMainPage.html",
                controller: "weatherMainPageCtrl"
            })
            $urlRouterProvider.otherwise("/app/home");
        });
})();