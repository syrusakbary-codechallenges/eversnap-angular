GraphResourceProvider = ($q, $resource, $log, storage, apiurl, config) ->
    _resource = $resource apiurl('/:objectId'), {},
        get:
            method: "GET"


    class GraphResource
        constructor: (@params) ->
            @params or= {}

        @resource: (args...) ->
            _resource.get(args...)

        @access_token: ->
            storage.get('access_token')

        loadData: (@data) ->
            @id = @data.id

        @get: (params, args...) ->
            defered = $q.defer()
            access_token = 
            params = _.merge(params or {}, {access_token:@access_token()})
            @resource(params, args...).$then((response) =>
                resource = new @(params)
                resource.loadData(response.data)
                defered.resolve(resource)
            )
            defered.promise

    class GraphPaginatedResource extends GraphResource
        constructor: () ->
            super
            @data = []
            @after = null
            @before = null
            @has_more = false

        loadData: (data) ->
            @data = data.data
            cursors = data.paging?.cursors
            @has_more = !!(data.paging?.next)
            @after = cursors?.after
            @before = cursors?.before

        next: (args...) ->
            return if not @after or not @has_more
            defered = $q.defer()
            params = _.merge(@params,  {'after': @after, access_token:@constructor.access_token()})
            @constructor.resource(params, args...).
                $then((response) =>
                    data = response.data
                    @data = _.union(@data, data.data)
                    @has_more = !!(data.paging?.next)
                    @after = data.paging?.cursors?.after
                    defered.resolve(@)
                )
            defered.promise

        previous: (args...) ->
            defered = $q.defer()
            params = _.merge(@params,  {'before': @before, access_token:@constructor.access_token()})
            @constructor.resource(params, args...).
                $then((response) =>
                    data = response.data
                    @data = _.union(data.data, @data)
                    @before = data.paging?.cursors?.before
                    defered.resolve(@)
                )
            defered.promise

    {
        'GraphResource': GraphResource,
        'GraphPaginatedResource': GraphPaginatedResource
    }

module = angular.module('eversnap.services.graph', ['eversnap.config'])
module.factory('$graph', ["$q", "$resource", "$log", "storage", "apiurl", "config", GraphResourceProvider])
