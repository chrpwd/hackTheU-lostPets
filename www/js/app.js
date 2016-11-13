// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova','firebase'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    })
})

.config(function($stateProvider, $urlRouterProvider) {

        $stateProvider

            .state('map', {
            url: '/',
            templateUrl: 'templates/map.html',
            controller: 'MapCtrl'
        })

        .state('report', {
            url: '/',
            templateUrl: 'templates/report.html',
            controller: 'reportCtrl'
        })
        .state('search', {
            url: '/',
            templateUrl: 'templates/search.html',
            controller: 'searchCtrl'
        });

        $urlRouterProvider.otherwise("/");

    })
    .controller('MapCtrl', function($scope, $state, $cordovaGeolocation, myLocation, $firebaseArray) {
        var options = {
            timeout: 10000,
            enableHighAccuracy: true
        };

        $scope.goToreport = function() {
            $state.go("report");
        }

         $scope.goTosearch = function() {
            $state.go("search");
        }


        $cordovaGeolocation.getCurrentPosition(options).then(function(position) {

            var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            myLocation.setPos({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
            var mapOptions = {
                center: latLng,
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

            //Wait until the map is loaded
            google.maps.event.addListenerOnce($scope.map, 'idle', function() {

                var marker = new google.maps.Marker({
                    map: $scope.map,
                    animation: google.maps.Animation.DROP,
                    position: latLng
                });

                var infoWindow = new google.maps.InfoWindow({
                    content: "Here I am!"
                });


                google.maps.event.addListener(marker, 'click', function() {
                    infoWindow.open($scope.map, marker);
                });
                var users = $firebaseArray(firebase.database().ref('list'));

                users.$loaded().then(function() {
                    angular.forEach(users, function(user) {
                        console.log(user);
                        var latLng = new google.maps.LatLng(user.position.lat, user.position.lng);
                        var marker = new google.maps.Marker({
                            map: $scope.map,
                            animation: google.maps.Animation.DROP,
                            position: latLng
                        });
                        var infoWindow = new google.maps.InfoWindow({
                    content: user.animal + ' ' + user.primaryColor + '/' + user.secondaryColor + ' ' + user.size
                });


                google.maps.event.addListener(marker, 'click', function() {
                    infoWindow.open($scope.map, marker);
                });
                    })
                })

            });

        }, function(error) {
            console.log("Could not get location");
        })

    })
.service('myLocation', function(){
    var position = {}

    function setPos(p){
        position = p;
    }

    function getPos(){
        return position;
    }

    return {
        setPos: setPos,
        getPos: getPos
    }
})
    .controller('reportCtrl', function($scope, $state, $firebaseArray, myLocation) {
    
        $scope.pet = {
            secondaryColor: '',
            primaryColor: '',
            size: '',
            animal: '',
            position: myLocation.getPos()
        };

        var list = $firebaseArray(firebase.database().ref('list'));


        $scope.goTomap = function() {
            $state.go("map");
        }

        $scope.goTosearch = function() {
            $state.go("search");
        }

        $scope.save = function() {
            list.$add($scope.pet);

        }

    })

    .controller('searchCtrl', function($scope, $state, $cordovaGeolocation) {

        $scope.goToreport = function() {
            $state.go("report");
        }

        $scope.goTomap = function() {
            $state.go("map");
        }

    });