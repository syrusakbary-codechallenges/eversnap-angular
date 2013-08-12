ConnectController = ($scope, $timeout, $location, storage, photo) ->
    $scope.connected = !!storage.get('access_token')
    $scope.$on('dataLoaded', -> 
    	$timeout( ->
    		FB.XFBML.parse()
    	, 0, false)
    )
    $scope.$broadcast('dataLoaded')

module = angular.module("eversnap.controllers.connect", [])
module.controller("ConnectController", ["$scope", "$timeout", "$location", "storage", ConnectController])
