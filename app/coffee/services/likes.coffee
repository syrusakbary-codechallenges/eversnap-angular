LikesApiClientProvider = ($resource, $graph, $log, storage, apiurl, config) ->
    # storage.set('access_token', '')
    _resource = $resource apiurl('/:objectId/likes'), {},
        get:
            method: "GET"
    
    class LikesResource extends $graph.GraphPaginatedResource
        @resource: (args...) ->
            _resource.get(args...)

module = angular.module('eversnap.services.likes', ['eversnap.config'])
module.factory('$likes', ["$resource", "$graph", "$log", "storage", "apiurl", "config", LikesApiClientProvider])
