AlbumsController = ($scope, $location, albums) ->
    refreshAlbums = ->
        $scope.albums = albums.data
        $scope.has_more = albums.has_more

    loadNextAlbums = ->
        albums.next().then(refreshAlbums)

    $scope.loadNextAlbums = loadNextAlbums
    
    refreshAlbums()

    # $scope.on("$routeChangeSuccess", ($currentRoute, $previousRoute ) ->
    #     console.log('a')
    #     $location.path(previousRoute);
    # )


module = angular.module("eversnap.controllers.albums", [])
module.controller("AlbumsController", ["$scope", "$location", "albums", AlbumsController])
