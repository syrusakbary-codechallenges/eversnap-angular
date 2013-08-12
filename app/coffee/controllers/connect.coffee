ConnectController = ($scope, $location, storage, photo) ->
    $scope.connected = !!storage.get('access_token')

module = angular.module("eversnap.controllers.connect", [])
module.controller("ConnectController", ["$scope", "$location", "storage", ConnectController])
