/*global _*/
(function () {
    "use strict";
    angular.module("myapp.controllers", [])

        .controller("signInCtrl", ["$scope", "$state", "$ionicPopup", '$q', function ($scope, $state, $ionicPopup, $q) {
            $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = false;
                $scope.$root.showSignUp = true;             
                $scope.isLandscape = false;
            });
            
            window.addEventListener("orientationchange", function () {
                // Announce the new orientation number
                switch (window.orientation) {
                    case -90:
                    case 90:
                        $scope.isLandscape = true;
                        $scope.$apply(); // <--
                        break;
                    default:
                        $scope.isLandscape = false;
                        $scope.$apply(); // <--
                        break;
                }
            }, false);

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
                                $state.go('news', {id: user.id});
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
                $scope.isLandscape = false;
            });
            
            window.addEventListener("orientationchange", function () {
                // Announce the new orientation number
                switch (window.orientation) {
                    case -90:
                    case 90:
                        $scope.isLandscape = true;
                        $scope.$apply(); // <--
                        break;
                    default:
                        $scope.isLandscape = false;
                        $scope.$apply(); // <--
                        break;
                }
            }, false);
            
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
                                   password: user.password,
                                   weatherLocations: [] });
                                    $state.go('signIn');
                                    });
                } else {
                    console.log("Action not completed");
                }
            }
        }])

        .controller("weatherMainPageCtrl", ["$scope", "$state", "$http", '$stateParams', '$ionicPopup', '$ionicScrollDelegate', 
        function ($scope, $state, $http,$stateParams, $ionicPopup, $ionicScrollDelegate) {
            $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = true;
                $scope.$root.showSignUp = false;
                $scope.$root.id = $stateParams.id;
                $scope.isLandscape = false;
            });
            
            window.addEventListener("orientationchange", function () {
                // Announce the new orientation number
                switch (window.orientation) {
                    case -90:
                    case 90:
                        $scope.isLandscape = true;
                        $scope.$apply(); // <--
                        break;
                    default:
                        $scope.isLandscape = false;
                        $scope.$apply(); // <--
                        break;
                }
            }, false);
            
            $scope.data={};
            var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
            $scope.tableHidden = true;
            $scope.data.searchBoxResponse = []; 
            $scope.data.cities = [];
            
            var onSuccess = function (position) {
                getCity(position.coords.longitude, position.coords.latitude);
                getWeather(position.coords.longitude, position.coords.latitude);
            };

            function onError(error) {
                $scope.weatherError = error;
            }

            navigator.geolocation.getCurrentPosition(onSuccess, onError);


            var getCity = function (longitude, latitude) {
                $http({
                    method: 'GET',
                    url: 'http://nominatim.openstreetmap.org/reverse?email=justin.atanasiu@gmail.com&format=json&lat=' + latitude + '&lon=' + longitude
                }).then(function successCallback(response) {
                    $scope.data.cityName = response.data.address.city + ", " + response.data.address.country;
                    $scope.data.cities.push({cityName: response.data.address.city + ", " + response.data.address.country,
                                             latitude: latitude,
                                             longitude: longitude})
                    localDB.get($scope.$root.id).then(function(result){
                        result.weatherLocations.forEach(function(location) {
                            $scope.data.cities.push(location);
                        }, this);
                    });
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
            }
            
            var getWeather = function(longitude, latitude, cityName){
                if(cityName)
                {   
                    $ionicScrollDelegate.scrollTop();
                    if(!$scope.tableHidden)
                        $scope.tableHidden = !$scope.tableHidden;
                    $scope.data.cityName = cityName;
                }
                $http({
                    method: 'GET',
                    url: 'https://api.forecast.io/forecast/2d4d24f3d98fd833669ca7ccd52a18bd/' + latitude + ',' + longitude + '?units=si'
                }).then(function successCallback(response) {
                    $scope.data.weather = Math.round(response.data.currently.temperature) + '\xB0' + 'C';
                    $scope.data.weatherMin = Math.round(response.data.daily.data[0].temperatureMin) + '\xB0' + 'C';
                    $scope.data.weatherMax = Math.round(response.data.daily.data[0].temperatureMax) + '\xB0' + 'C';
                    response.data.hourly.data.splice(12);
                    (response.data.hourly.data).forEach(function(element) {
                       element.temperature = Math.round(element.temperature) + '\xB0' + 'C';
                       element.time = element.time * 1000;
                       var time = new Date(element.time);
                       var timeHours = (time.getHours() > 9) ? time.getHours() : ('0' + time.getHours());
                       element.time = timeHours + ":00";
                    }, this);                    
                    $scope.data.weatherInHours = response.data.hourly.data;
                    (response.data.daily.data).forEach(function(element) {
                       element.temperatureMax = Math.round(element.temperatureMax) + '\xB0' + 'C';
                       element.temperatureMin = Math.round(element.temperatureMin) + '\xB0' + 'C';
                       element.time = element.time * 1000;
                       var time = new Date(element.time);                       
                       element.time = days[time.getDay() ];
                    }, this);  
                    $scope.data.weatherInDays = response.data.daily.data; 
                    var sunriseTime = new Date(response.data.daily.data[0].sunriseTime*1000);
                    var sunriseHours =  (sunriseTime.getHours() > 9) ? sunriseTime.getHours() : ('0'+sunriseTime.getHours());
                    var sunriseMinutes = (sunriseTime.getMinutes() > 9) ? sunriseTime.getMinutes() : ('0'+sunriseTime.getMinutes());
                    $scope.data.sunriseTime = sunriseHours + ':' + sunriseMinutes;
                    var sunsetTime = new Date(response.data.daily.data[0].sunsetTime*1000);
                    var sunsetHours = (sunsetTime.getHours() > 9) ? sunsetTime.getHours() : ('0'+sunsetTime.getHours());
                    var sunsetMinutes = (sunsetTime.getMinutes() > 9) ? sunsetTime.getMinutes() : ('0'+sunsetTime.getMinutes());
                    $scope.data.sunsetTime = sunsetHours  + ':' + sunsetMinutes;
                    $scope.data.windSpeed = response.data.currently.windSpeed + ' m/s';
                    $scope.data.humidity = response.data.currently.humidity * 100 + '%';
                    $scope.data.apTemp = response.data.currently.apparentTemperature + '\xB0' + 'C';
                    if (response.data.minutely)
                        $scope.data.hourDescr = response.data.minutely.summary;
                    if (response.data.hourly)
                        $scope.data.dayDescr = response.data.hourly.summary;
                    if (response.data.daily)
                        $scope.data.weekDescr = response.data.daily.summary;
                }, function errorCallback(response) {
                     var alertPopup = $ionicPopup.alert({
                                    title: 'Fetching data failed!',
                                    template: 'We are sorry, but we could not reach you'
                                });
                                return;
                });
            }
            
            $scope.getWeather = getWeather;
            // $scope.data.weather = '-12' + '\xB0' + 'C';
            // $scope.data.weatherMin = '-15\xB0' + 'C';
            // $scope.data.weatherMax = '-10\xB0' + 'C';
            // $scope.data.weatherInHours = [{temperature: 50}, {temperature: -10}, {temperature: -20}, {temperature: 50}, {temperature: -10}, {temperature: -20}, {temperature: 50}, {temperature: -10}, {temperature: -20}];
            var showTable = function () {
                $scope.tableHidden = !$scope.tableHidden;
            }

            $scope.showTable = showTable;
                    
            var selectCity = function (city) {
                $scope.data.searchBox = '';
                $scope.data.cities.push({cityName: city.matching_full_name, latitude: city._embedded['city:item'].location.latlon.latitude, longitude: city._embedded['city:item'].location.latlon.longitude});
                localDB.get($scope.$root.id).then(function (result) {
                    var myObj = { cityName: city.matching_full_name, latitude: city._embedded['city:item'].location.latlon.latitude, longitude: city._embedded['city:item'].location.latlon.longitude}
                    result.weatherLocations.push(myObj);
                    return localDB.put(result, $scope.$root.id, result._rev);
                }).then(function (response) {
                    // handle response
                }).catch(function (err) {
                    console.log(err);
                });

            }

            $scope.selectCity = selectCity;
                    
            var searchList = function (searchBox) {
                $http({
                    method: 'GET',
                    url: 'https://api.teleport.org/api/cities/?search=' + searchBox + '&embed=city%3Asearch-results%2Fcity%3Aitem'
                }).then(function successCallback(response) {
                    response.data._embedded['city:search-results'].splice(5);
                    $scope.data.searchBoxResponse = response.data._embedded['city:search-results'];
                }, function errorCallback(response) {

                });
            }
                    
            $scope.searchList = searchList;

            var removeLocation = function ($index) {
                $scope.data.cities.splice($index, 1);
                localDB.get($scope.$root.id).then(function (result) {

                    result.weatherLocations.splice($index - 1, 1);

                    return localDB.put(result, $scope.$root.id, result._rev);
                }).then(function (response) {
                    // handle response
                }).catch(function (err) {
                    console.log(err);
                });
            }

            $scope.removeLocation = removeLocation;
            
            
        }])

        .controller("calendarMainPageCtrl", ["$scope", "$state", "$stateParams", function ($scope, $state, $stateParams) {
            $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = true;
                $scope.$root.showSignUp = false;
                $scope.$root.id = $stateParams.id;
            });
        }])

        .controller("newsMainPageCtrl", ["$scope", "$state", "$stateParams", '$http', 'xmlParser', function ($scope, $statem, $stateParams, $http, xmlParser) {
            $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = true;
                $scope.$root.showSignUp = false;
                $scope.$root.id = $stateParams.id;
            });
            $scope.data = {}
            $scope.data.newsSites = [];
            $scope.data.newsSites.push({ url: 'http://www.bloomberg.com' });
            $scope.data.feeds = [];
            $scope.feedSrc = 'http://rss.cnn.com/rss/cnn_topstories.rss'   
            var loadFeed = function (e) {
                $http({
                    method: 'GET',
                    url: 'http://rss.cnn.com/rss/cnn_topstories.rss'
                }).then(function (res) {
                    var jsonFromXMLRSS = convertXML(res.data, false);
                    $scope.data.feeds = jsonFromXMLRSS.rss.channel.item; 
                    window.localStorage["nodes"] = JSON.stringify($scope.data.feeds);
                }).catch(function (err) {
                    console.log(err);
                });
            }
            
            loadFeed();
            
            var convertXML = function (data, _withOutBind) {

                if (_withOutBind === true) {
                    try {
                        return xmlParser.xml_str2json_withOutBind(data);
                    } catch (EE) {
                    }

                } else {
                    return xmlParser.xml_str2json(data);
                }
            }

            $scope.browse = function (v) {
                window.open(v, "_system", "location=yes");
            }
        }])

        .factory('xmlParser', function () {
            var x2js = new X2JS();
            return {
                xml2json: x2js.xml2json,
                xml_str2json_withOutBind: x2js.xml_str2json,
                xml_str2json: function (args) {
                    return angular.bind(x2js, x2js.xml_str2json, args)();
                },
                json2xml: x2js.json2xml_str
            }
        })
        
        .controller("financialManagerCtrl", ["$scope", "$state", "$stateParams", function ($scope, $state, $stateParams) {
            $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = true;
                $scope.$root.showSignUp = false;
                $scope.$root.id = $stateParams.id;
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