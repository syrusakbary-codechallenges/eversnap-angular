SrDirective = ($rootScope) ->
    restrict: "A"
    link: (scope, elm, attrs) ->
        srdata = if $rootScope.sr then $rootScope.sr else {}
        element = angular.element(elm)

        result = srdata
        for name in attrs.sr.split(".")
            result = result[name]
            if result is undefined or typeof result is "string"
                break

        if result
            element.html(result)


module = angular.module('eversnap.directives.main', [])
module.directive("sr", ["$rootScope", SrDirective])
