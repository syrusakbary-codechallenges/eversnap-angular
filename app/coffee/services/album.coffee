AlbumApiClientProvider = ($graph, $photos, $q, $log, storage, apiurl, config) ->
    # storage.set('access_token', '')
    class AlbumResource extends $graph.GraphResource
        @get: (fields) ->
            fields['fields'] = ['name', 'photos.images'].join(',')
            super(fields)

        loadData: ->
            super
            @id = @data.id
            @name = @data.name
            @photos = new $photos(albumId:@params.objectId)
            @photos.loadData(@data.photos) if @data.photos

module = angular.module('eversnap.services.album', ['eversnap.config'])
module.factory('$album', ["$graph", "$photos", "$q", "$log", "storage", "apiurl", "config", AlbumApiClientProvider])
