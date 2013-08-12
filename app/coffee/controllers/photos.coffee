PhotosController = ($scope, $location, album) ->
    $scope.album = album

    loadNextPhotos = ->
        album.photos.next().then(refreshPhotos)

    orderedPhotos = []
        
    refreshPhotos = ->
        $scope.photos = album.photos.data
        orderedPhotos = _.pluck(album.photos.data, 'id')
        $scope.has_more = album.photos.has_more

    goPhotoIndex = (index) ->
        photo_id = orderedPhotos[index]
        if photo_id < 0
            $location.path("/album/#{$scope.album.data.id}/photos/")
        else if index >= orderedPhotos.length
            if album.photos.has_more
                loadNextPhotos().then(->
                    goPhotoIndex(index)
                )
            else
                goPhotoIndex(0)
        else if photo_id
            $location.path("/album/#{$scope.album.data.id}/photos/#{photo_id}")

    $scope.goNext =  (photo_id) ->
        current = _.indexOf(orderedPhotos, photo_id)
        goPhotoIndex(current+1)

    $scope.loadNextPhotos = loadNextPhotos
    
    refreshPhotos()

module = angular.module("eversnap.controllers.photos", [])
module.controller("PhotosController", ["$scope", "$location", "album", PhotosController])
