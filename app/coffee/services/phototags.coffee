PhotoTagsApiClientProvider = ($resource, $graph, $log, storage, apiurl, config) ->
    # storage.set('access_token', '')
    _resource = $resource apiurl('/:objectId/tags'), {},
        get:
            method: "GET"

    class PhotoTagsResource extends $graph.GraphPaginatedResource
        @resource: (args...) ->
            _resource.get(args...)

module = angular.module('eversnap.services.phototags', ['eversnap.config'])
module.factory('$phototags', ["$resource", "$graph", "$log", "storage", "apiurl", "config", PhotoTagsApiClientProvider])
