PhotoApiClientProvider = ($graph, $comments, $phototags, $q, $log, storage, apiurl, config) ->
    # storage.set('access_token', '')
    class PhotoResource extends $graph.GraphResource
        constructor: () ->
            super

        loadData: ->
            super
            @comments = new $comments(objectId:@params.objectId)
            @comments.loadData(@data.comments) if @data.comments
            @tags = new $phototags(objectId:@params.objectId)
            @tags.loadData(@data.tags) if @data.tags

module = angular.module('eversnap.services.photo', ['eversnap.services.phototags','eversnap.services.comments','eversnap.config'])
module.factory('$photo', ["$graph", "$comments", "$phototags", "$q", "$log", "storage", "apiurl", "config", PhotoApiClientProvider])
