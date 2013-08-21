(function() {
  var configFn, init, modules;

  configFn = function($routeProvider, $locationProvider, $httpProvider, $compileProvider, $provide, $stateProvider, $urlRouterProvider) {
    var authHttpIntercept, defaultHeaders, invalidAccess;
    $stateProvider.state('albums', {
      url: '/albums',
      templateUrl: 'partials/albums.html',
      resolve: {
        albums: function($q, $stateParams, $albums) {
          return $albums.get();
        }
      },
      controller: "AlbumsController"
    }).state('connect', {
      url: '/connect',
      templateUrl: 'partials/connect.html',
      controller: "ConnectController"
    }).state('photos', {
      url: '/album/:albumId/photos/',
      templateUrl: 'partials/photos.html',
      resolve: {
        album: function($q, $stateParams, $album) {
          var albumId;
          albumId = $stateParams.albumId;
          return $album.get({
            objectId: albumId
          });
        }
      },
      controller: "PhotosController"
    }).state('photos.view', {
      url: ':photoId',
      templateUrl: 'partials/photoview.html',
      onEnter: function() {
        return $('#photoview').addClass('photoview-active');
      },
      onExit: function() {
        return $('#photoview').removeClass('photoview-active');
      },
      resolve: {
        photo: function($q, $stateParams, $photo) {
          var photoId;
          photoId = $stateParams.photoId;
          return $photo.get({
            objectId: photoId
          });
        }
      },
      controller: "PhotoViewController"
    });
    $urlRouterProvider.otherwise("/albums");
    defaultHeaders = {
      "Content-Type": "application/json"
    };
    $httpProvider.defaults.headers["delete"] = defaultHeaders;
    $httpProvider.defaults.headers.patch = defaultHeaders;
    $httpProvider.defaults.headers.post = defaultHeaders;
    $httpProvider.defaults.headers.put = defaultHeaders;
    invalidAccess = function(response) {
      var _ref;
      return response.status !== 200 || (response.status === 200 && ((_ref = response.data.error) != null ? _ref.code : void 0) === 200);
    };
    authHttpIntercept = function($q, $location, storage) {
      return function(promise) {
        return promise.then(null, function(response) {
          if (invalidAccess(response)) {
            storage.remove('access_token');
            $location.url("/connect");
          }
          return $q.reject(response);
        });
      };
    };
    $provide.factory("authHttpIntercept", ["$q", "$location", "storage", authHttpIntercept]);
    return $httpProvider.responseInterceptors.push('authHttpIntercept');
  };

  modules = ["ngResource", "ui.compat", "eversnap.services.storage", "eversnap.services.apiurl", "eversnap.services.graph", "eversnap.services.albums", "eversnap.services.album", "eversnap.services.photos", "eversnap.services.photo", "eversnap.directives.main", "eversnap.directives.fbimage", "eversnap.controllers.albums", "eversnap.controllers.photos", "eversnap.controllers.photoview", "eversnap.controllers.connect"];

  init = function($rootScope, $location, $timeout, $window, storage) {
    return $window.fbAsyncInit = function() {
      FB.init({
        appId: '154920714712792',
        channelUrl: 'http://localhost:9001/channel.html',
        status: true,
        xfbml: true
      });
      return FB.Event.subscribe('auth.authResponseChange', function(response) {
        var access_token, is_logged, user_id;
        is_logged = !!storage.get('access_token');
        if (response.status === 'connected') {
          access_token = response.authResponse.accessToken;
          user_id = response.authResponse.userID;
          storage.set('access_token', access_token);
          if (!is_logged) {
            return $timeout(function() {
              return $location.path('/albums');
            }, 100);
          }
        } else {
          return storage.remove('access_token');
        }
      });
    };
  };

  this.app = angular.module("eversnap", modules).filter('moment', function() {
    return function(dateString, format) {
      return moment(dateString).format(format);
    };
  });

  this.app.config(['$routeProvider', '$locationProvider', '$httpProvider', '$compileProvider', '$provide', '$stateProvider', '$urlRouterProvider', configFn]);

  this.app.run(['$rootScope', '$location', '$timeout', '$window', 'storage', init]);

}).call(this);

(function() {
  var module;

  module = angular.module('eversnap.config', []);

  module.value('config', {
    host: "graph.facebook.com",
    scheme: "https"
  });

}).call(this);

(function() {
  var AlbumsController, module;

  AlbumsController = function($scope, $location, albums) {
    var loadNextAlbums, refreshAlbums;
    refreshAlbums = function() {
      $scope.albums = albums.data;
      return $scope.has_more = albums.has_more;
    };
    loadNextAlbums = function() {
      return albums.next().then(refreshAlbums);
    };
    $scope.loadNextAlbums = loadNextAlbums;
    return refreshAlbums();
  };

  module = angular.module("eversnap.controllers.albums", []);

  module.controller("AlbumsController", ["$scope", "$location", "albums", AlbumsController]);

}).call(this);

(function() {
  var ConnectController, module;

  ConnectController = function($scope, $timeout, $location, storage, photo) {
    $scope.connected = !!storage.get('access_token');
    $scope.$on('dataLoaded', function() {
      return $timeout(function() {
        return FB.XFBML.parse();
      }, 0, false);
    });
    return $scope.$broadcast('dataLoaded');
  };

  module = angular.module("eversnap.controllers.connect", []);

  module.controller("ConnectController", ["$scope", "$timeout", "$location", "storage", ConnectController]);

}).call(this);

(function() {
  var PhotosController, module;

  PhotosController = function($scope, $location, album) {
    var goPhotoIndex, loadNextPhotos, orderedPhotos, refreshPhotos;
    $scope.album = album;
    loadNextPhotos = function() {
      return album.photos.next().then(refreshPhotos);
    };
    orderedPhotos = [];
    refreshPhotos = function() {
      $scope.photos = album.photos.data;
      orderedPhotos = _.pluck(album.photos.data, 'id');
      return $scope.has_more = album.photos.has_more;
    };
    goPhotoIndex = function(index) {
      var photo_id;
      photo_id = orderedPhotos[index];
      if (photo_id < 0) {
        return $location.path("/album/" + $scope.album.data.id + "/photos/");
      } else if (index >= orderedPhotos.length) {
        if (album.photos.has_more) {
          return loadNextPhotos().then(function() {
            return goPhotoIndex(index);
          });
        } else {
          return goPhotoIndex(0);
        }
      } else if (photo_id) {
        return $location.path("/album/" + $scope.album.data.id + "/photos/" + photo_id);
      }
    };
    $scope.goNext = function(photo_id) {
      var current;
      current = _.indexOf(orderedPhotos, photo_id);
      return goPhotoIndex(current + 1);
    };
    $scope.loadNextPhotos = loadNextPhotos;
    return refreshPhotos();
  };

  module = angular.module("eversnap.controllers.photos", []);

  module.controller("PhotosController", ["$scope", "$location", "album", PhotosController]);

}).call(this);

(function() {
  var PhotoViewController, module;

  PhotoViewController = function($scope, $location, photo) {
    var loadNextComments, refreshComments, _ref;
    $('#photoview').addClass('photoview-active');
    $scope.photo = photo.data;
    $scope.tags = (_ref = photo.tags) != null ? _ref.data : void 0;
    $scope.ratio = photo.data.width / photo.data.height;
    refreshComments = function() {
      var _ref1, _ref2;
      $scope.comments = (_ref1 = photo.comments) != null ? _ref1.data : void 0;
      return $scope.more_comments = (_ref2 = photo.comments) != null ? _ref2.has_more : void 0;
    };
    loadNextComments = function() {
      return photo.comments.next().then(refreshComments);
    };
    $scope.loadNextComments = loadNextComments;
    $scope.closeView = function() {
      return $location.path("/album/" + $scope.album.data.id + "/photos/");
    };
    return refreshComments();
  };

  module = angular.module("eversnap.controllers.photoview", []);

  module.controller("PhotoViewController", ["$scope", "$location", "photo", PhotoViewController]);

}).call(this);

(function() {
  var AlbumApiClientProvider, module,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AlbumApiClientProvider = function($graph, $photos, $q, $log, storage, apiurl, config) {
    var AlbumResource, _ref;
    return AlbumResource = (function(_super) {
      __extends(AlbumResource, _super);

      function AlbumResource() {
        _ref = AlbumResource.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      AlbumResource.get = function(fields) {
        fields['fields'] = ['name', 'photos.images'].join(',');
        return AlbumResource.__super__.constructor.get.call(this, fields);
      };

      AlbumResource.prototype.loadData = function() {
        AlbumResource.__super__.loadData.apply(this, arguments);
        this.id = this.data.id;
        this.name = this.data.name;
        this.photos = new $photos({
          albumId: this.params.objectId
        });
        if (this.data.photos) {
          return this.photos.loadData(this.data.photos);
        }
      };

      return AlbumResource;

    })($graph.GraphResource);
  };

  module = angular.module('eversnap.services.album', ['eversnap.config']);

  module.factory('$album', ["$graph", "$photos", "$q", "$log", "storage", "apiurl", "config", AlbumApiClientProvider]);

}).call(this);

(function() {
  var AlbumsApiClientProvider, module,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  AlbumsApiClientProvider = function($resource, $graph, $log, storage, apiurl, config) {
    var AlbumsResource, _ref, _resource;
    _resource = $resource(apiurl('/me/albums'), {
      fields: 'picture,count,name',
      limit: '12'
    }, {
      get: {
        method: "GET"
      }
    });
    return AlbumsResource = (function(_super) {
      __extends(AlbumsResource, _super);

      function AlbumsResource() {
        _ref = AlbumsResource.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      AlbumsResource.resource = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _resource.get.apply(_resource, args);
      };

      return AlbumsResource;

    })($graph.GraphPaginatedResource);
  };

  module = angular.module('eversnap.services.albums', ['eversnap.config']);

  module.factory('$albums', ["$resource", "$graph", "$log", "storage", "apiurl", "config", AlbumsApiClientProvider]);

}).call(this);

(function() {
  angular.module('eversnap.services.apiurl', ['eversnap.config'], function($provide) {
    var urlsFn;
    urlsFn = function(config) {
      var host, scheme;
      host = config.host || "localhost:8000";
      scheme = config.scheme || "http";
      return function(url) {
        return _.str.sprintf("%s://%s%s", scheme, host, url);
      };
    };
    return $provide.factory("apiurl", ['config', urlsFn]);
  });

}).call(this);

(function() {
  var CommentsApiClientProvider, module,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  CommentsApiClientProvider = function($resource, $graph, $log, storage, apiurl, config) {
    var CommentsResource, _ref, _resource;
    _resource = $resource(apiurl('/:objectId/comments'), {}, {
      get: {
        method: "GET"
      }
    });
    return CommentsResource = (function(_super) {
      __extends(CommentsResource, _super);

      function CommentsResource() {
        _ref = CommentsResource.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      CommentsResource.resource = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _resource.get.apply(_resource, args);
      };

      return CommentsResource;

    })($graph.GraphPaginatedResource);
  };

  module = angular.module('eversnap.services.comments', ['eversnap.config']);

  module.factory('$comments', ["$resource", "$graph", "$log", "storage", "apiurl", "config", CommentsApiClientProvider]);

}).call(this);

(function() {
  var GraphResourceProvider, module,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  GraphResourceProvider = function($q, $resource, $log, storage, apiurl, config) {
    var GraphPaginatedResource, GraphResource, _resource;
    _resource = $resource(apiurl('/:objectId'), {}, {
      get: {
        method: "GET"
      }
    });
    GraphResource = (function() {
      function GraphResource(params) {
        this.params = params;
        this.params || (this.params = {});
      }

      GraphResource.resource = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _resource.get.apply(_resource, args);
      };

      GraphResource.access_token = function() {
        return storage.get('access_token');
      };

      GraphResource.prototype.loadData = function(data) {
        this.data = data;
        return this.id = this.data.id;
      };

      GraphResource.get = function() {
        var access_token, args, defered, params,
          _this = this;
        params = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        defered = $q.defer();
        access_token = params = _.merge(params || {}, {
          access_token: this.access_token()
        });
        this.resource.apply(this, [params].concat(__slice.call(args))).$then(function(response) {
          var resource;
          resource = new _this(params);
          resource.loadData(response.data);
          return defered.resolve(resource);
        });
        return defered.promise;
      };

      return GraphResource;

    })();
    GraphPaginatedResource = (function(_super) {
      __extends(GraphPaginatedResource, _super);

      function GraphPaginatedResource() {
        GraphPaginatedResource.__super__.constructor.apply(this, arguments);
        this.data = [];
        this.after = null;
        this.before = null;
        this.has_more = false;
      }

      GraphPaginatedResource.prototype.loadData = function(data) {
        var cursors, _ref, _ref1;
        this.data = data.data;
        cursors = (_ref = data.paging) != null ? _ref.cursors : void 0;
        this.has_more = !!((_ref1 = data.paging) != null ? _ref1.next : void 0);
        this.after = cursors != null ? cursors.after : void 0;
        return this.before = cursors != null ? cursors.before : void 0;
      };

      GraphPaginatedResource.prototype.next = function() {
        var args, defered, params, _ref,
          _this = this;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (!this.after || !this.has_more) {
          return;
        }
        defered = $q.defer();
        params = _.merge(this.params, {
          'after': this.after,
          access_token: this.constructor.access_token()
        });
        (_ref = this.constructor).resource.apply(_ref, [params].concat(__slice.call(args))).$then(function(response) {
          var data, _ref, _ref1, _ref2;
          data = response.data;
          _this.data = _.union(_this.data, data.data);
          _this.has_more = !!((_ref = data.paging) != null ? _ref.next : void 0);
          _this.after = (_ref1 = data.paging) != null ? (_ref2 = _ref1.cursors) != null ? _ref2.after : void 0 : void 0;
          return defered.resolve(_this);
        });
        return defered.promise;
      };

      GraphPaginatedResource.prototype.previous = function() {
        var args, defered, params, _ref,
          _this = this;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        defered = $q.defer();
        params = _.merge(this.params, {
          'before': this.before,
          access_token: this.constructor.access_token()
        });
        (_ref = this.constructor).resource.apply(_ref, [params].concat(__slice.call(args))).$then(function(response) {
          var data, _ref, _ref1;
          data = response.data;
          _this.data = _.union(data.data, _this.data);
          _this.before = (_ref = data.paging) != null ? (_ref1 = _ref.cursors) != null ? _ref1.before : void 0 : void 0;
          return defered.resolve(_this);
        });
        return defered.promise;
      };

      return GraphPaginatedResource;

    })(GraphResource);
    return {
      'GraphResource': GraphResource,
      'GraphPaginatedResource': GraphPaginatedResource
    };
  };

  module = angular.module('eversnap.services.graph', ['eversnap.config']);

  module.factory('$graph', ["$q", "$resource", "$log", "storage", "apiurl", "config", GraphResourceProvider]);

}).call(this);

(function() {
  var LikesApiClientProvider, module,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  LikesApiClientProvider = function($resource, $graph, $log, storage, apiurl, config) {
    var LikesResource, _ref, _resource;
    _resource = $resource(apiurl('/:objectId/likes'), {}, {
      get: {
        method: "GET"
      }
    });
    return LikesResource = (function(_super) {
      __extends(LikesResource, _super);

      function LikesResource() {
        _ref = LikesResource.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      LikesResource.resource = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _resource.get.apply(_resource, args);
      };

      return LikesResource;

    })($graph.GraphPaginatedResource);
  };

  module = angular.module('eversnap.services.likes', ['eversnap.config']);

  module.factory('$likes', ["$resource", "$graph", "$log", "storage", "apiurl", "config", LikesApiClientProvider]);

}).call(this);

(function() {
  var PhotoApiClientProvider, module,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  PhotoApiClientProvider = function($graph, $comments, $phototags, $q, $log, storage, apiurl, config) {
    var PhotoResource;
    return PhotoResource = (function(_super) {
      __extends(PhotoResource, _super);

      function PhotoResource() {
        PhotoResource.__super__.constructor.apply(this, arguments);
      }

      PhotoResource.prototype.loadData = function() {
        PhotoResource.__super__.loadData.apply(this, arguments);
        this.comments = new $comments({
          objectId: this.params.objectId
        });
        if (this.data.comments) {
          this.comments.loadData(this.data.comments);
        }
        this.tags = new $phototags({
          objectId: this.params.objectId
        });
        if (this.data.tags) {
          return this.tags.loadData(this.data.tags);
        }
      };

      return PhotoResource;

    })($graph.GraphResource);
  };

  module = angular.module('eversnap.services.photo', ['eversnap.services.phototags', 'eversnap.services.comments', 'eversnap.config']);

  module.factory('$photo', ["$graph", "$comments", "$phototags", "$q", "$log", "storage", "apiurl", "config", PhotoApiClientProvider]);

}).call(this);

(function() {
  var PhotosApiClientProvider, module,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  PhotosApiClientProvider = function($resource, $graph, $log, storage, apiurl, config) {
    var PhotosResource, _ref, _resource;
    _resource = $resource(apiurl('/:albumId/photos'), {}, {
      get: {
        method: "GET"
      }
    });
    return PhotosResource = (function(_super) {
      __extends(PhotosResource, _super);

      function PhotosResource() {
        _ref = PhotosResource.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      PhotosResource.resource = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _resource.get.apply(_resource, args);
      };

      return PhotosResource;

    })($graph.GraphPaginatedResource);
  };

  module = angular.module('eversnap.services.photos', ['eversnap.config']);

  module.factory('$photos', ["$resource", "$graph", "$log", "storage", "apiurl", "config", PhotosApiClientProvider]);

}).call(this);

(function() {
  var PhotoTagsApiClientProvider, module,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  PhotoTagsApiClientProvider = function($resource, $graph, $log, storage, apiurl, config) {
    var PhotoTagsResource, _ref, _resource;
    _resource = $resource(apiurl('/:objectId/tags'), {}, {
      get: {
        method: "GET"
      }
    });
    return PhotoTagsResource = (function(_super) {
      __extends(PhotoTagsResource, _super);

      function PhotoTagsResource() {
        _ref = PhotoTagsResource.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      PhotoTagsResource.resource = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _resource.get.apply(_resource, args);
      };

      return PhotoTagsResource;

    })($graph.GraphPaginatedResource);
  };

  module = angular.module('eversnap.services.phototags', ['eversnap.config']);

  module.factory('$phototags', ["$resource", "$graph", "$log", "storage", "apiurl", "config", PhotoTagsApiClientProvider]);

}).call(this);

(function() {
  angular.module('eversnap.services.storage', [], function($provide) {
    var storageFn;
    storageFn = function($rootScope) {
      var backend, service;
      service = {};
      backend = localStorage;
      service.get = function(key, _default) {
        var serializedValue;
        serializedValue = backend.getItem(key);
        if (serializedValue === null) {
          return _default || null;
        }
        return JSON.parse(serializedValue);
      };
      service.set = function(key, val) {
        if (_.isObject(key)) {
          return _.each(key, function(val, key) {
            return service.set(key, val);
          });
        } else {
          return backend.setItem(key, JSON.stringify(val));
        }
      };
      service.remove = function(key) {
        return backend.removeItem(key);
      };
      service.clear = function() {
        return backend.clear();
      };
      return service;
    };
    return $provide.factory('storage', ['$rootScope', storageFn]);
  });

}).call(this);

(function() {
  var FacebookImageDirective, module;

  FacebookImageDirective = function($rootScope) {
    return {
      restrict: "A",
      priority: 100,
      link: function(scope, elm, attrs) {
        var setSrc;
        setSrc = function(src) {
          console.log(src, elm);
          return elm.css('background-image', "url(" + src + ")");
        };
        return attrs.$observe('fbImage', function(value) {
          var filtered, minWidth, src;
          src = scope.$eval(value);
          if (_.isArray(src)) {
            filtered = _.filter(src, function(image) {
              return image.width > 180 && image.height > 180;
            });
            minWidth = _.sortBy(filtered, 'width')[0];
            src = minWidth.source;
          }
          return setSrc(src);
        });
      }
    };
  };

  module = angular.module('eversnap.directives.fbimage', []);

  module.directive("fbImage", ["$rootScope", FacebookImageDirective]);

}).call(this);

(function() {
  var SrDirective, module;

  SrDirective = function($rootScope) {
    return {
      restrict: "A",
      link: function(scope, elm, attrs) {
        var element, name, result, srdata, _i, _len, _ref;
        srdata = $rootScope.sr ? $rootScope.sr : {};
        element = angular.element(elm);
        result = srdata;
        _ref = attrs.sr.split(".");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          result = result[name];
          if (result === void 0 || typeof result === "string") {
            break;
          }
        }
        if (result) {
          return element.html(result);
        }
      }
    };
  };

  module = angular.module('eversnap.directives.main', []);

  module.directive("sr", ["$rootScope", SrDirective]);

}).call(this);
