configFn = ($routeProvider, $locationProvider, $httpProvider,
            $compileProvider, $provide, $stateProvider, $urlRouterProvider) ->

    # Define application routes
    $stateProvider
        .state('albums', {
            url: '/albums',
            templateUrl: 'partials/albums.html',
            resolve: {
                albums:  ($q, $stateParams, $albums) ->
                    $albums.get()
            }
            controller: "AlbumsController"
        })
        .state('connect', {
            url: '/connect',
            templateUrl: 'partials/connect.html',
            controller: "ConnectController"
        })
        .state('photos', {
            url: '/album/:albumId/photos/',
            templateUrl: 'partials/photos.html',
            resolve: {
                album:  ($q, $stateParams, $album) ->
                    albumId = $stateParams.albumId
                    $album.get(objectId:albumId)
            },
            controller: "PhotosController"
        })
        .state('photos.view', {
            url: ':photoId',
            templateUrl: 'partials/photoview.html',
            onEnter: () ->
                $('body').css({position:'fixed',width:'100%'})
            ,
            onExit: () ->
                $('body').css('position','')
            ,
            resolve: {
                photo:  ($q, $stateParams, $photo) ->
                    photoId = $stateParams.photoId
                    $photo.get(objectId:photoId)
            },
            controller: "PhotoViewController"
        })

    $urlRouterProvider.otherwise("/albums") 
    # $routeProvider.otherwise({redirectTo: '/albums'})

    # $locationProvider.html5Mode(true);

    # Setup default content type
    defaultHeaders =
        "Content-Type": "application/json",

    $httpProvider.defaults.headers.delete = defaultHeaders
    $httpProvider.defaults.headers.patch = defaultHeaders
    $httpProvider.defaults.headers.post = defaultHeaders
    $httpProvider.defaults.headers.put = defaultHeaders

    # Http 400 intercept and automatic logout
    invalidAccess = (response) ->
        response.status != 200 or (response.status == 200 and response.data.error?.code == 200)

    authHttpIntercept = ($q, $location, storage) ->
        return (promise) ->
            return promise.then null, (response) ->
                if invalidAccess(response)
                    storage.remove('access_token')
                    $location.url("/connect")
                return $q.reject(response)

    $provide.factory("authHttpIntercept", ["$q", "$location", "storage", authHttpIntercept])
    $httpProvider.responseInterceptors.push('authHttpIntercept')

# https://graph.facebook.com/10151731287355661/picture?type=thumbnail&access_token=CAACEdEose0cBAEDOxQszTbBIQWd3XwL1qDf59mZAroLeZCJn2sRqp0Rq214kXZAw6gfSV9cywEZAItORhwRoHwZAyG64sDMU8kZBwHLwxP2TqnbGSQnTkqPAYtMiYwAKJrHtG6JrlOVGWiit966DJ2ZAN1EqYYAPxDqPbLgNdg0WQZDZD&width=200&height=200


modules = [
    "ngResource",
    "ui.compat",
    "eversnap.services.storage",
    "eversnap.services.apiurl",
    "eversnap.services.graph",
    "eversnap.services.albums",
    "eversnap.services.album",
    "eversnap.services.photos",
    "eversnap.services.photo",
    "eversnap.directives.main",
    "eversnap.directives.fbimage",
    "eversnap.controllers.albums",
    "eversnap.controllers.photos",
    "eversnap.controllers.photoview",
    "eversnap.controllers.connect",
]

init = ($rootScope, $location, $timeout, $window, storage) ->
    $window.fbAsyncInit = ->
        FB.init({
            appId      : '154920714712792',
            channelUrl : 'http://localhost:9001/channel.html',
            status     : true,
            xfbml      : true
        })
        FB.Event.subscribe('auth.authResponseChange', (response) ->
            is_logged = !!storage.get('access_token')
            if response.status == 'connected'
                access_token = response.authResponse.accessToken
                user_id = response.authResponse.userID
                storage.set('access_token', access_token)
                if !is_logged
                    $timeout(->
                        $location.path('/albums')
                    , 100)
            else
                storage.remove('access_token')
        )


@app = angular.module("eversnap", modules).filter('moment', ->
    (dateString, format) ->
        return moment(dateString).format(format)
)

@app.config(['$routeProvider', '$locationProvider', '$httpProvider', '$compileProvider', '$provide', '$stateProvider', '$urlRouterProvider', configFn])
@app.run(['$rootScope', '$location', '$timeout', '$window', 'storage', init])
