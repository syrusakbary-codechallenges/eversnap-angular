angular.module 'eversnap.services.storage', [], ($provide) ->
    storageFn = ($rootScope) ->
        service = {}
        backend = localStorage

        service.get = (key, _default) ->
            serializedValue = backend.getItem(key)
            if serializedValue == null
                return _default or null

            return JSON.parse(serializedValue)

        service.set = (key, val) ->
            if _.isObject(key)
                _.each key, (val, key) ->
                    service.set(key, val)
            else
                backend.setItem(key, JSON.stringify(val))

        service.remove = (key) ->
            backend.removeItem(key)

        service.clear = ->
            backend.clear()

        return service

    $provide.factory('storage', ['$rootScope', storageFn])
