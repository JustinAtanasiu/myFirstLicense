(function () {
    "use strict";

    angular.module("myapp", ["ionic", "myapp.controllers", "myapp.services", "ngCordova", "angular-md5", 'ionic-timepicker'])
        .run(function ($ionicPlatform, $cordovaDevice, $timeout, $rootScope) {
            $ionicPlatform.ready(function () {
                if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }
                if (device !== undefined && device !== null)
                    if (device.platform === "iOS") {
                        window.plugin.notification.local.promptForPermission();
                    }
                cordova.plugins.notification.local.on('trigger', function (notification) {
                    window.plugins.toast.showWithOptions(
                        {
                            message: notification.text,
                            duration: 4000, // ms
                            position: "top",
                            addPixelsY: 40,  // (optional) added a negative value to move it up a bit (default 0)
                            data: { 'foo': 'bar' } // (optional) pass in a JSON object here (it will be sent back in the success callback below)
                        },
                        // implement the success callback
                        function (result) {
                            window.plugins.toast.hide();
                        }
                        );
                }, this);
            });
        })
        .config(function ($stateProvider, $urlRouterProvider, ionicTimePickerProvider) {
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
                    params: { id: null }
                })
                .state("calendar", {
                    url: "/calendar",
                    cache: false,
                    templateUrl: "app/calendar/calendarMainPage.html",
                    controller: "calendarMainPageCtrl",
                    params: { id: null }
                })
                .state("news", {
                    url: "/news",
                    cache: false,
                    templateUrl: "app/news/newsMainPage.html",
                    controller: "newsMainPageCtrl",
                    params: { id: null }
                })
                .state("financialManager", {
                    url: "/financialManager",
                    cache: false,
                    templateUrl: "app/financialManager/financialManagerPage.html",
                    controller: "financialManagerCtrl",
                    params: { id: null }
                })
                .state("notes", {
                    url: "/notes",
                    cache: false,
                    templateUrl: "app/notes/notesPage.html",
                    controller: "notesCtrl",
                    params: { id: null }
                })
            var timePickerObj = {
                inputTime: (((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60)),
                format: 24,
                step: 1,
                setLabel: 'Set',
                closeLabel: 'Close'
            };
            ionicTimePickerProvider.configTimePicker(timePickerObj);
            $urlRouterProvider.otherwise("signIn");
        });
})();