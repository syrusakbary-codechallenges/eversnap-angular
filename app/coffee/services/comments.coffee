CommentsApiClientProvider = ($resource, $graph, $log, storage, apiurl, config) ->
    # storage.set('access_token', '')
    _resource = $resource apiurl('/:objectId/comments'), {},
        get:
            method: "GET"

    class CommentsResource extends $graph.GraphPaginatedResource
        @resource: (args...) ->
            _resource.get(args...)

module = angular.module('eversnap.services.comments', ['eversnap.config'])
module.factory('$comments', ["$resource", "$graph", "$log", "storage", "apiurl", "config", CommentsApiClientProvider])
