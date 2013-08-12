PhotosApiClientProvider = ($resource, $graph, $log, storage, apiurl, config) ->
    # storage.set('access_token', '')
    _resource = $resource apiurl('/:albumId/photos'), {}, 
        get:
            method: "GET"

    class PhotosResource extends $graph.GraphPaginatedResource
        @resource: (args...) ->
            _resource.get(args...)

module = angular.module('eversnap.services.photos', ['eversnap.config'])
module.factory('$photos', ["$resource", "$graph", "$log", "storage", "apiurl", "config", PhotosApiClientProvider])
