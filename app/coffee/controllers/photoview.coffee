PhotoViewController = ($scope, $location, photo) ->
    $('#photoview').addClass('photoview-active')
    $scope.photo = photo.data
    $scope.tags = photo.tags?.data
    $scope.ratio = photo.data.width/photo.data.height
    
    refreshComments = ->
    	$scope.comments = photo.comments?.data
    	$scope.more_comments = photo.comments?.has_more

    loadNextComments = ->
        photo.comments.next().then(refreshComments)

    $scope.loadNextComments = loadNextComments

    $scope.closeView = () ->
        $location.path("/album/#{$scope.album.data.id}/photos/")

    refreshComments()
   
module = angular.module("eversnap.controllers.photoview", [])
module.controller("PhotoViewController", ["$scope", "$location", "photo", PhotoViewController])
