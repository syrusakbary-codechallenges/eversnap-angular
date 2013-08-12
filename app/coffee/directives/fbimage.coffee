FacebookImageDirective = ($rootScope) ->
    restrict: "A",
    priority: 100,
    link: (scope, elm, attrs) ->
        setSrc = (src) ->
            console.log src, elm
            elm.css('background', "url(#{src})");

        attrs.$observe('fbImage', (value) ->
            src = scope.$eval(value)
            if _.isArray(src)
                filtered = _.filter(src, (image) -> image.width > 180 and image.height > 180)
                minWidth = _.sortBy(filtered, 'width')[0]
                src = minWidth.source
            setSrc(src)
        )
module = angular.module('eversnap.directives.fbimage', [])
module.directive("fbImage", ["$rootScope", FacebookImageDirective])
