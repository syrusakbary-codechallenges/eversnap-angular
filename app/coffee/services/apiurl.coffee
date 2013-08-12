angular.module 'eversnap.services.apiurl', ['eversnap.config'], ($provide) ->
    urlsFn = (config) ->
        host = config.host or "localhost:8000"
        scheme = config.scheme or "http"

        return (url) ->
            return _.str.sprintf("%s://%s%s", scheme, host, url)

    $provide.factory("apiurl", ['config', urlsFn])
