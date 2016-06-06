/*global _*/
(function () {
    "use strict";
    angular.module("myapp.controllers", [])

        .controller("signInCtrl", ["$scope", "$state", "$ionicPopup", '$q', 'dbService', function ($scope, $state, $ionicPopup, $q, dbService) {
            $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = false;
                $scope.$root.showSignUp = true;      
                switch (window.orientation) {
                    case -90:
                    case 90:
                        $scope.isLandscape = true;
                        break;
                    default:
                        $scope.isLandscape = false;
                        break;
                }  
                if(localStorage.token && localStorage.id){
                    dbService.get(localStorage.id).then(function(result){
                        $state.go('news', { id: localStorage.id });
                    }).catch(function (err) {
                    });                    
                }
               
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
                dbService.login(username,password);
            }
        }])

        .controller("signUpCtrl", ["$scope", "$state", "$ionicPopup", "$q", 'dbService', function ($scope, $state, $ionicPopup, $q, dbService) {
            $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = false;
                $scope.$root.showSignUp = false;      
                switch (window.orientation) {
                    case -90:
                    case 90:
                        $scope.isLandscape = true;
                        break;
                    default:
                        $scope.isLandscape = false;
                        break;
                }         
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

            $scope.create = function (user) {
                dbService.create(user)
            }
        }])

        .controller("weatherMainPageCtrl", ["$scope", "$state", "$http", '$stateParams', '$ionicPopup', '$ionicScrollDelegate', 'dbService',
        function ($scope, $state, $http,$stateParams, $ionicPopup, $ionicScrollDelegate, dbService) {
            $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = true;
                $scope.$root.showSignUp = false;
                $scope.$root.id = $stateParams.id;    
                switch (window.orientation) {
                    case -90:
                    case 90:
                        $scope.isLandscape = true;
                        break;
                    default:
                        $scope.isLandscape = false;
                        break;
                }           
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
                    method: 'POST',
                    url: 'http://localhost:8080/api/location',
                    data: {latitude: latitude, longitude: longitude},
                    headers: {
                        'x-access-token': localStorage.token
                    }
                }).then(function successCallback(response) {
                    $scope.data.cityName = response.data.address.city + ", " + response.data.address.country;
                    $scope.data.cities.push({cityName: response.data.address.city + ", " + response.data.address.country,
                                             latitude: latitude,
                                             longitude: longitude})
                    dbService.get($scope.$root.id).then(function(result){
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
                    method: 'POST',
                    url: 'http://localhost:8080/api/weather',
                    data: { latitude: latitude, longitude: longitude },
                    headers: {
                        'x-access-token': localStorage.token
                    }
                }).then(function successCallback(response) {
                    $scope.data.weather = Math.round(response.data.currently.temperature) + '\xB0' + 'C';
                    $scope.data.weatherMin = Math.round(response.data.daily.data[0].temperatureMin) + '\xB0' + 'C';
                    $scope.data.weatherMax = Math.round(response.data.daily.data[0].temperatureMax) + '\xB0' + 'C';
                    response.data.hourly.data.splice(12);
                    var offset = response.data.offset;
                    (response.data.hourly.data).forEach(function(element) {
                       element.temperature = Math.round(element.temperature) + '\xB0' + 'C';
                       element.time = (element.time * 1000) + (offset*60 + new Date().getTimezoneOffset())*60*1000;
                       var time = new Date(element.time);
                       var timeHours = (time.getHours() > 9) ? time.getHours() : ('0' + time.getHours());
                       element.time = timeHours + ":00";
                       element.iconPath = "img/weatherIcons/" + element.icon + ".png";
                    }, this);                    
                    $scope.data.weatherInHours = response.data.hourly.data;
                    (response.data.daily.data).forEach(function(element) {
                       element.temperatureMax = Math.round(element.temperatureMax) + '\xB0' + 'C';
                       element.temperatureMin = Math.round(element.temperatureMin) + '\xB0' + 'C';
                       element.time = (element.time * 1000) + (offset*60 + new Date().getTimezoneOffset())*60*1000;
                       var time = new Date(element.time);       
                       element.iconPath = "img/weatherIcons/" + element.icon + ".png";                
                       element.time = days[time.getDay()];
                    }, this);  
                    $scope.data.weatherInDays = response.data.daily.data; 
                    var sunriseTime = new Date(response.data.daily.data[0].sunriseTime*1000 + (offset*60 + new Date().getTimezoneOffset())*60*1000);
                    var sunriseHours =  (sunriseTime.getHours() > 9) ? sunriseTime.getHours() : ('0'+sunriseTime.getHours());
                    var sunriseMinutes = (sunriseTime.getMinutes() > 9) ? sunriseTime.getMinutes() : ('0'+sunriseTime.getMinutes());
                    $scope.data.sunriseTime = sunriseHours + ':' + sunriseMinutes;
                    var sunsetTime = new Date(response.data.daily.data[0].sunsetTime*1000 + (offset*60 + new Date().getTimezoneOffset())*60*1000);
                    var sunsetHours = (sunsetTime.getHours() > 9) ? sunsetTime.getHours() : ('0'+sunsetTime.getHours());
                    var sunsetMinutes = (sunsetTime.getMinutes() > 9) ? sunsetTime.getMinutes() : ('0'+sunsetTime.getMinutes());
                    $scope.data.sunsetTime = sunsetHours  + ':' + sunsetMinutes;
                    $scope.data.windSpeed = response.data.currently.windSpeed + ' m/s';
                    $scope.data.humidity = (response.data.currently.humidity * 100).toFixed(1) + '%';
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

            $scope.getBackgroundStyle = function (imagepath) {
                if(imagepath){
                    var css = {
                        'background-image': 'url(' + imagepath + ')',
                        'background-position': 'center',
                        'background-repeat': 'no-repeat',
                        'opacity': '0.7'
                    }
                    return css;
                }
                else
                    return {
                        'background-image': 'url(img/weatherIcons/clear-day.png)',
                        'background-position': 'center',
                        'background-repeat': 'no-repeat',
                        'opacity': '0.7'
                    };
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
                dbService.get($scope.$root.id).then(function (result) {
                    var myObj = { cityName: city.matching_full_name, latitude: city._embedded['city:item'].location.latlon.latitude, longitude: city._embedded['city:item'].location.latlon.longitude}
                    result.weatherLocations.push(myObj);
                    return dbService.put(result, $scope.$root.id, result._rev);
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
                dbService.get($scope.$root.id).then(function (result) {

                    result.weatherLocations.splice($index - 1, 1);

                    return dbService.put(result, $scope.$root.id, result._rev);
                }).then(function (response) {
                    // handle response
                }).catch(function (err) {
                    console.log(err);
                });
            }

            $scope.removeLocation = removeLocation;
            
            
        }])

        .controller("calendarMainPageCtrl", ["$scope", "$state", "$stateParams", '$cordovaLocalNotification', 'ionicTimePicker', 'dbService', function ($scope, $state, $stateParams, $cordovaLocalNotification, ionicTimePicker, dbService) {
            $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = true;
                $scope.$root.showSignUp = false;
                $scope.$root.id = $stateParams.id;
            });
            $scope.data = {};
            $scope.data.alarms = [];
            var weekdaysDisplay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            
            dbService.get($scope.$root.id).then(function (result) {
                if (result.alarmTimes.length > 2) {
                    result.alarmTimes.sort(function (a, b) {
                        a.hours = a.hourMinutes.substring(0, a.hourMinutes.indexOf(":"));
                        a.minutes = a.hourMinutes.substring(a.hourMinutes.indexOf(":") + 1, a.hourMinutes.length);
                        b.hours = b.hourMinutes.substring(0, b.hourMinutes.indexOf(":"));
                        b.minutes = b.hourMinutes.substring(b.hourMinutes.indexOf(":") + 1, b.hourMinutes.length);
                        if (parseInt(a.hours) === parseInt(b.hours))
                            return parseInt(a.minutes) - parseInt(b.minutes);
                        else
                            return parseInt(a.hours) - parseInt(b.hours);
                    });
                }
                $scope.data.alarms = result.alarmTimes;
                    
            });
            
            var nextDay = function(x, hour, minute) {
                var now = new Date();
                now.setHours(hour, minute, 0, 0);
                now.setDate(now.getDate() + (x + (7 - now.getDay())) % 7);
                return now;
            }
            
            $scope.saveAlarm = function(alarm, weekDays){
                if(alarm.active){
                    if (alarm.weekDaysDisplay !== "Next") {
                        weekDays.forEach(function (element, index) {
                            if(element === 1){
                                var hour = parseInt(alarm.hourMinutes.split(":")[0]);
                                var minutes = parseInt(alarm.hourMinutes.split(":")[1]);
                                var alarmTime = nextDay(index,hour,minutes);
                                var today = new Date();
                                if(today.getDay() === index){
                                    if (today.getHours() > hour) {
                                        alarmTime.setDate(alarmTime.getDate() + 7);
                                    } else if (today.getHours() === hour) {
                                        if (minutes <= today.getMinutes()) {
                                            alarmTime.setDate(alarmTime.getDate() + 7);
                                        }
                                    } 
                                }
                                cordova.plugins.notification.local.schedule({
                                    id: alarm.id,
                                    title: "Reminder",
                                    text: alarm.message ? alarm.message : "No reminder message",
                                    firstAt: alarmTime,
                                    every: "week",
                                });
                            }
                        });
                       
                    }
                    else {
                        var alarmTime = new Date();
                        var hour = parseInt(alarm.hourMinutes.split(":")[0]);
                        var minutes = parseInt(alarm.hourMinutes.split(":")[1]);
                        if (alarmTime.getHours() < hour) {
                            alarmTime.setHours(hour, minutes, 0, 0);
                        } else if (alarmTime.getHours() === hour) {
                            if (minutes > alarmTime.getMinutes()) {
                                alarmTime.setHours(hour, minutes, 0, 0);
                            }
                            else {
                                alarmTime.setHours(hour, minutes, 0, 0);
                                alarmTime.setDate(alarmTime.getDate() + 1);
                            }
                        } else {
                            alarmTime.setHours(hour, minutes,0,0);
                            alarmTime.setDate(alarmTime.getDate() + 1);
                        }
                        cordova.plugins.notification.local.schedule({
                            id: alarm.id,
                            title: "Reminder",
                            text: alarm.message ? alarm.message : "No reminder message",
                            at: alarmTime,
                        });
                    }
                }
                else {
                    cordova.plugins.notification.local.cancel(alarm.id, function () {
                        // Notification was cancelled
                    }, $scope);
                }
                dbService.get($scope.$root.id).then(function (result) {
                    result.alarmTimes = $scope.data.alarms;
                    return dbService.put(result, $scope.$root.id, result._rev);
                }).then(function (response) {
                    // handle response
                }).catch(function (err) {
                    console.log(err);
                });
            }
            
            $scope.addAlarmTime = function () {                
                var ipObj1 = {
                    callback: function (val, weekDays) {      //Mandatory
                        if (typeof (val) === 'undefined') {
                            console.log('Time not selected');
                        } else {
                             addAlarm(val,weekDays);
                        }
                    },
                    setLabel: 'Add',
                    closeLabel: 'Close',
                    inputTime: (((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60))
                };
                ionicTimePicker.openTimePicker(ipObj1);                
            }
            
            $scope.removeAlarm = function(index){            

                cordova.plugins.notification.local.cancel($scope.data.alarms[index].id, function () {
                    // Notification was cancelled
                }, $scope);            
                
                $scope.data.alarms.splice(index, 1);
                 dbService.get($scope.$root.id).then(function (result) {
                    result.alarmTimes = $scope.data.alarms;
                    return dbService.put(result, $scope.$root.id, result._rev);
                }).then(function (response) {
                    // handle response
                }).catch(function (err) {
                    console.log(err);
                });
            }
            
            var addAlarm = function (val, weekDays) {
                var displayDays =[];
                var maxId=1;
                $scope.data.alarms.forEach(function(element){
                    if(maxId<=element.id)
                        maxId = element.id;
                });
                weekDays.forEach(function(element, index) {
                    if(element === 1){
                        displayDays.push(weekdaysDisplay[index]);
                    }
                }, this);
                var myAlarm = {
                    hourMinutes: val.hours + ":" + val.minutes,
                    message: val.message ? val.message : "No reminder message",
                    weekDaysDisplay: displayDays.length ? displayDays.join(',') : "Next",
                    active: true,
                    id: maxId+1
                };
                $scope.data.alarms.push(myAlarm);
                $scope.saveAlarm(myAlarm, weekDays);                
            };
            
        }])

        .controller("newsMainPageCtrl", ["$scope", "$state", "$stateParams", '$http', 'xmlParser', function ($scope, $statem, $stateParams, $http, xmlParser) {
            $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = true;
                $scope.$root.showSignUp = false;
                $scope.$root.id = $stateParams.id;     
                switch (window.orientation) {
                    case -90:
                    case 90:
                        $scope.isLandscape = true;
                        break;
                    default:
                        $scope.isLandscape = false;
                        break;
                }         
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
            
            $scope.data = {}
            $scope.data.filter = "Top News";
            $scope.data.feeds = [];
            $scope.feedSrc = [];
             
            var loadFeed = function (e) {
                $http({
                    method: 'GET',
                    url: e
                }).then(function (res) {
                    var jsonFromXMLRSS = convertXML(res.data, false);                  
                    $scope.data.feeds = $scope.data.feeds.concat(jsonFromXMLRSS.rss.channel.item.splice(0, 6));                    
                    $scope.data.feeds.forEach(function(feed){
                        if(feed.link.substring(0,1) === "/" && $scope.data.filter === "Sports")
                            feed.link = "http://www.fifa.com"+feed.link;
                        if (feed) {
                            if (feed.thumbnail && feed.thumbnail._url) {
                                if (feed.thumbnail._width < 300 || feed.thumbnail._height < 300) {
                                    if ($scope.data.filter === "Sports")
                                        feed.thumbnail = { _url: 'img/news/sportNews.jpg' };
                                    else
                                        feed.thumbnail = { _url: 'img/news/newsBackground2.jpg' };
                                }
                            }
                            else if (feed.content && feed.content.thumbnail && feed.content.thumbnail._url) {
                                feed.thumbnail = feed.content.thumbnail;
                            }
                            else if (feed.thumbnail && feed.thumbnail[0]._url) {
                                if (feed.thumbnail[0]._width < 300 || feed.thumbnail[0]._height < 300) {
                                    if ($scope.data.filter === "Sports")
                                        feed.thumbnail = { _url: 'img/news/sportNews.jpg' };
                                    else
                                        feed.thumbnail = { _url: 'img/news/newsBackground.jpg' };
                                }
                                else
                                    feed.thumbnail = feed.thumbnail[0]
                            }
                            else if (feed.enclosure && feed.enclosure._url) {
                                feed.thumbnail = feed.enclosure;
                            }
                            else {
                                if ($scope.data.filter === "Sports")
                                    feed.thumbnail = { _url: 'img/news/sportNews.jpg' };
                                else
                                    feed.thumbnail = { _url: 'img/news/newsBackground.jpg'};
                           }
                       }
                    });
                    shuffleArray($scope.data.feeds);
                }).catch(function (err) {
                    console.log(err);
                });
            }
            
            
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
            
            $scope.$watch("data.filter", function (value) {
                if (value === "Top News") {
                    $scope.feedSrc = [];
                    $scope.feedSrc.push("http://feeds.bbci.co.uk/news/world/europe/rss.xml");
                    $scope.feedSrc.push("http://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml");
                    $scope.feedSrc.push("http://feeds.bbci.co.uk/news/world/middle_east/rss.xml");
                    $scope.feedSrc.push("http://www.forbes.com/most-popular/feed/");
                    $scope.feedSrc.push("http://feeds.skynews.com/feeds/rss/world.xml");
                    $scope.feedSrc.push("http://syndication.cbc.ca/partnerrss/world.xml");
                }
                else if (value === "Economy") {
                    $scope.feedSrc = [];
                    
                    $scope.feedSrc.push("http://feeds.bbci.co.uk/news/video_and_audio/business/rss.xml");
                    $scope.feedSrc.push("http://www.tradingeconomics.com/european-union/rss");
                    $scope.feedSrc.push("http://www.tradingeconomics.com/united-states/rss");
                    $scope.feedSrc.push("http://feeds.skynews.com/feeds/rss/business.xml");
                }
                else if (value === "Politics") {
                    $scope.feedSrc = [];
                    $scope.feedSrc.push("http://feeds.bbci.co.uk/news/video_and_audio/politics/rss.xml");
                    $scope.feedSrc.push("http://feeds.abcnews.com/abcnews/politicsheadlines");
                    $scope.feedSrc.push("http://feeds.skynews.com/feeds/rss/politics.xml");
                    $scope.feedSrc.push("https://globalvoices.org/-/topics/politics/feed/");
                }
                else if (value === "Science and Environment") {
                    $scope.feedSrc = [];
                    $scope.feedSrc.push("http://feeds.bbci.co.uk/news/video_and_audio/science_and_environment/rss.xml");
                    $scope.feedSrc.push("http://www.forbes.com/technology/feed/");
                    $scope.feedSrc.push("http://feeds.skynews.com/feeds/rss/technology.xml");
                    $scope.feedSrc.push("http://www.nasa.gov/rss/dyn/image_of_the_day.rss");
                    $scope.feedSrc.push("http://www.techlearning.com/RSS");
                }
                else if (value === "Sports") {
                    $scope.feedSrc = [];             
                    $scope.feedSrc.push("http://feeds.bbci.co.uk/sport/0/rss.xml?edition=uk");
                    $scope.feedSrc.push("http://feeds.abcnews.com/abcnews/sportsheadlines");
                    $scope.feedSrc.push("http://www.fifa.com/rss/index.xml");
                    $scope.feedSrc.push("http://www.fifa.com/news/interviews/rss.xml");            
                }
                
            $scope.feedSrc.forEach(function (element) {
                $scope.data.feeds = [];
                loadFeed(element);
            }, this);
            });
            
            function shuffleArray(array) {
                for (var i = array.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
                return array;
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
        
        .controller("financialManagerCtrl", ["$scope", "$state", "$stateParams", 'dbService', function ($scope, $state, $stateParams, dbService) {
            $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = true;
                $scope.$root.showSignUp = false;
                $scope.$root.id = $stateParams.id;     
                switch (window.orientation) {
                    case -90:
                    case 90:
                        $scope.isLandscape = true;
                        break;
                    default:
                        $scope.isLandscape = false;
                        break;
                }
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
            $scope.tableHidden = true;
            $scope.data = {};
            $scope.data.monthlyTransactions = [];
            var myInitialInfo;
            var myResetDay;
            var myResetMonth;
            
            dbService.get($scope.$root.id).then(function (result) {
                myInitialInfo = result.financialInformation;
                $scope.data.monthlyIncome = result.financialInformation.monthlyIncome;
                $scope.data.monthlySpendings = result.financialInformation.monthlySpendings;
                $scope.data.todaySpendings = result.financialInformation.todaySpendings;
                $scope.data.dayOfTheMonth = result.financialInformation.dayOfTheMonth;
                $scope.data.totalSpendingsMonth = result.financialInformation.totalSpendingsMonth;
                myResetDay = new Date(result.financialInformation.resetDay);
                myResetMonth = new Date(result.financialInformation.resetMonth);
                $scope.data.monthlyTransactions = result.financialInformation.monthlyTransactions
                
                var oldTransactions = [];
                $scope.data.monthlyTransactions.forEach(function(transaction, index){
                   if(new Date(transaction.date) < (new Date()).addMonths(-1))
                        oldTransactions.push(index);
                });
                
                oldTransactions.forEach(function(indexOfTransaction){
                    $scope.data.monthlyTransactions.splice(indexOfTransaction,1);
                });
                
                if (new Date() > myResetMonth) {
                    $scope.data.remainingSum = $scope.data.monthlyIncome - $scope.data.monthlySpendings;
                    $scope.data.totalSpendingsMonth = 0;
                    if ((new Date()).getMonth() !== 11)
                        myResetMonth = new Date(myResetMonth.getFullYear(), myResetMonth.getMonth() + 1, $scope.data.dayOfTheMonth + 1, 0, 0, 0);
                    else
                        myResetMonth = new Date(myResetMonth.getFullYear() + 1, myResetMonth.getMonth() + 1, $scope.data.dayOfTheMonth + 1, 0, 0, 0);
                    
                }
                else
                    $scope.data.remainingSum = $scope.data.monthlyIncome - $scope.data.monthlySpendings + $scope.data.totalSpendingsMonth;

                if (((new Date()).getDay() - myResetDay.getDay()) !== 0) {
                    $scope.data.todaySpendings = 0;
                    myResetDay = (new Date());
                }
                
                $scope.saveInformation();
                    
            }).then(function (response) {
                // handle response
            }).catch(function (err) {
                console.log(err);
                });
                
            $scope.getDate = function (string) {
                return new Date(string);
            }
                
            Date.isLeapYear = function (year) {
                return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
            };

            Date.getDaysInMonth = function (year, month) {
                return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
            };

            Date.prototype.isLeapYear = function () {
                return Date.isLeapYear(this.getFullYear());
            };    
                
            Date.prototype.getDaysInMonth = function () {
                return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
            };
           
            Date.prototype.addMonths = function (value) {
                var n = this.getDate();
                this.setDate(1);
                this.setMonth(this.getMonth() + value);
                this.setDate(Math.min(n, this.getDaysInMonth()));
                return this;
            };
            
            $scope.showTable = function(){
                $scope.tableHidden = !$scope.tableHidden;
            };
            
            
            $scope.saveInformation = function(){
                if($scope.data.monthlySpendings === null || $scope.data.monthlySpendings === undefined)                    
                    $scope.data.monthlySpendings = 0;
                if($scope.data.monthlyIncome === null || $scope.data.monthlyIncome === undefined)                    
                    $scope.data.monthlyIncome = 0;    
                if($scope.data.dayOfTheMonth === null || $scope.data.dayOfTheMonth === undefined)                    
                    $scope.data.dayOfTheMonth = 1;   
                    
                dbService.get($scope.$root.id).then(function (result) {
                    var myObj = {  monthlyIncome: $scope.data.monthlyIncome,
                    monthlySpendings: $scope.data.monthlySpendings,
                    todaySpendings: $scope.data.todaySpendings,
                    dayOfTheMonth: $scope.data.dayOfTheMonth,
                    totalSpendingsMonth: $scope.data.totalSpendingsMonth,
                    resetDay: myResetDay,
                    resetMonth: myResetMonth,
                    monthlyTransactions: $scope.data.monthlyTransactions
                    }
                    result.financialInformation = myObj;
                    return dbService.put(result, $scope.$root.id, result._rev);
                }).then(function (response) {
                    // handle response
                }).catch(function (err) {
                    console.log(err);
                });
                
            };
            
            $scope.$watch('data.monthlyIncome', function (newVal, oldVal) {
                if (newVal !== undefined && oldVal !== undefined)
                    $scope.data.remainingSum += newVal - oldVal;
            });

            $scope.$watch('data.monthlySpendings', function (newVal, oldVal) {
                if (newVal !== undefined && oldVal !== undefined) 
                    $scope.data.remainingSum -= newVal - oldVal;
            });
            
            $scope.$watchCollection("[data.remainingSum, data.dayOfTheMonth]", function(newVal, oldVal){     
                if($scope.data.dayOfTheMonth<=0)
                    $scope.data.dayOfTheMonth = 1;
                if (new Date().getDate() < $scope.data.dayOfTheMonth) {
                    myResetMonth = new Date((new Date()).getFullYear(), (new Date()).getMonth(), $scope.data.dayOfTheMonth + 1);
                }
                else {
                    if ((new Date()).getMonth() !== 11)
                        myResetMonth = new Date((new Date()).getFullYear(), (new Date()).getMonth() + 1, $scope.data.dayOfTheMonth + 1);
                    else
                        myResetMonth = new Date((new Date()).getFullYear() + 1, (new Date()).getMonth() + 1, $scope.data.dayOfTheMonth + 1);
                }

                if (!$scope.data.dayOfTheMonth)
                    $scope.data.dailySumLeft = undefined;
                else {
                    var now = new Date();
                    var nowDays = now.getDate();
                    var nowMonths = now.getMonth();
                    
                    if (nowMonths === 1) {
                        if (nowDays >= getLastDayMonth($scope.data.dayOfTheMonth))
                            $scope.data.dailySumLeft = (($scope.data.remainingSum) / (29 - nowDays + getLastDayMonth($scope.data.dayOfTheMonth))).toFixed(2);
                        else
                            $scope.data.dailySumLeft = (($scope.data.remainingSum) / (getLastDayMonth($scope.data.dayOfTheMonth) - nowDays)).toFixed(2);
                    }
                    else if (nowMonths === 0 || nowMonths === 2 || nowMonths === 4 || nowMonths === 6 || nowMonths === 7 || nowMonths === 9 || nowMonths === 11) {
                        if (nowDays >= getLastDayMonth($scope.data.dayOfTheMonth))
                            $scope.data.dailySumLeft = (($scope.data.remainingSum) / (32 - nowDays + getLastDayMonth($scope.data.dayOfTheMonth))).toFixed(2);
                        else
                            $scope.data.dailySumLeft = (($scope.data.remainingSum) / (getLastDayMonth($scope.data.dayOfTheMonth) - nowDays)).toFixed(2);
                    }
                    else {
                        if (nowDays >= getLastDayMonth($scope.data.dayOfTheMonth))
                            $scope.data.dailySumLeft = (($scope.data.remainingSum) / (31 - nowDays + getLastDayMonth($scope.data.dayOfTheMonth))).toFixed(2);
                        else
                            $scope.data.dailySumLeft = (($scope.data.remainingSum) / (getLastDayMonth($scope.data.dayOfTheMonth) - nowDays)).toFixed(2);
                    }
                    
                  
                }
            });
            
            var getLastDayMonth = function (day) {
                if ((new Date()).getMonth() === 1 && day > 29) {
                    $scope.data.dayOfTheMonth = 29;
                    return 29;
                }
                else if (((new Date()).getMonth() === 3 || (new Date()).getMonth() === 5 || (new Date()).getMonth() === 8 || (new Date()).getMonth() === 10) && day > 30) {
                    $scope.data.dayOfTheMonth = 30;
                    return 30;
                }
                else if (((new Date()).getMonth() === 0 || (new Date()).getMonth() === 2 || (new Date()).getMonth() === 4 || (new Date()).getMonth() === 6 || (new Date()).getMonth() === 7 || (new Date()).getMonth() === 9 || (new Date()).getMonth() === 11) && day > 31) {
                    $scope.data.dayOfTheMonth = 31;
                    return 31;
                }
                else
                    return day;
            }
            
            $scope.registerIncomeSpending = function(){  
                if ($scope.data.incomeSpending) {
                    $scope.data.monthlyTransactions.push({
                        sum: $scope.data.incomeSpending,
                        displaySum: $scope.data.incomeSpending > 0 ? '+' + $scope.data.incomeSpending.toString() : $scope.data.incomeSpending.toString(),
                        date: (new Date()).toUTCString()
                    });
                    $scope.data.todaySpendings += $scope.data.incomeSpending;
                    $scope.data.remainingSum += $scope.data.incomeSpending;
                    $scope.data.totalSpendingsMonth += $scope.data.incomeSpending;
                    $scope.data.incomeSpending = undefined;
                    $scope.saveInformation();
                }
            }
        }])
        .controller("notesCtrl", ["$scope", "$state", "$stateParams", 'dbService', function ($scope, $state, $stateParams, dbService) {
           $scope.$on('$ionicView.beforeEnter', function (e, data) {
                $scope.$root.showMenuItems = true;
                $scope.$root.showSignUp = false;
                $scope.$root.id = $stateParams.id;     
                switch (window.orientation) {
                    case -90:
                    case 90:
                        $scope.isLandscape = true;
                        break;
                    default:
                        $scope.isLandscape = false;
                        break;
                }
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
            $scope.tableHidden = true;
            $scope.data.notesList = [];
            $scope.data.selectedNote = {};
            
            dbService.get($scope.$root.id).then(function (result) {
                $scope.data.notesList = result.notesList;
                if (result.notesList === undefined || (result.notesList && result.notesList.length === 0))
                    $scope.data.selectedNote = { text: "There are no active notes" };
                else
                    $scope.data.selectedNote = result.notesList[0];
            });
            
            $scope.showTable = function(){
                $scope.tableHidden = !$scope.tableHidden;
            }
            $scope.addNote = function(){
                $scope.saveNote();
                $scope.data.notesList.push({text: '', date: (new Date).toUTCString()});
                $scope.data.selectedNote = $scope.data.notesList[$scope.data.notesList.length-1];                
            }
            
            $scope.removeNote = function (index) {
                $scope.data.notesList.splice(index, 1);
                if ($scope.data.notesList.length > 0)
                    $scope.data.selectedNote = $scope.data.notesList[0]
                else
                    $scope.data.selectedNote = { text: "There are no active notes" };
                $scope.saveNote();
            }
            
            $scope.saveNote = function(){                
                var tempNote = angular.copy($scope.data.selectedNote);
                if(tempNote && tempNote.date){
                $scope.data.notesList.forEach(function(note, index){
                        if(note.date === tempNote.date){
                            $scope.data.notesList[index] = tempNote;
                            return;
                        }
                    });
                }
                 dbService.get($scope.$root.id).then(function (result) {
                        result.notesList = $scope.data.notesList;
                    return dbService.put(result, $scope.$root.id, result._rev);
                }).then(function (response) {
                    // handle response
                }).catch(function (err) {
                    console.log(err);
                });
            }
            
            $scope.getDate = function(string){
                return new Date(string);
            }
            
            $scope.selectNote = function(note){
                $scope.data.selectedNote = note;
            }
                       
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