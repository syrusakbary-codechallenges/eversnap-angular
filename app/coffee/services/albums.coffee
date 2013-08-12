AlbumsApiClientProvider = ($resource, $graph, $log, storage, apiurl, config) ->
    # storage.set('access_token', '')
    _resource = $resource apiurl('/me/albums'), {fields:'picture,count,name', limit:'12'},
        get:
            method: "GET"

    class AlbumsResource extends $graph.GraphPaginatedResource
        @resource: (args...) ->
            _resource.get(args...)


module = angular.module('eversnap.services.albums', ['eversnap.config'])
module.factory('$albums', ["$resource", "$graph", "$log", "storage", "apiurl", "config", AlbumsApiClientProvider])
