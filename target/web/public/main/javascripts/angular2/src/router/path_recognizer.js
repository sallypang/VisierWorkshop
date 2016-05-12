'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var url_parser_1 = require('./url_parser');
var TouchMap = (function () {
    function TouchMap(map) {
        var _this = this;
        this.map = {};
        this.keys = {};
        if (lang_1.isPresent(map)) {
            collection_1.StringMapWrapper.forEach(map, function (value, key) {
                _this.map[key] = lang_1.isPresent(value) ? value.toString() : null;
                _this.keys[key] = true;
            });
        }
    }
    TouchMap.prototype.get = function (key) {
        collection_1.StringMapWrapper.delete(this.keys, key);
        return this.map[key];
    };
    TouchMap.prototype.getUnused = function () {
        var _this = this;
        var unused = {};
        var keys = collection_1.StringMapWrapper.keys(this.keys);
        keys.forEach(function (key) { return unused[key] = collection_1.StringMapWrapper.get(_this.map, key); });
        return unused;
    };
    return TouchMap;
})();
function normalizeString(obj) {
    if (lang_1.isBlank(obj)) {
        return null;
    }
    else {
        return obj.toString();
    }
}
var ContinuationSegment = (function () {
    function ContinuationSegment() {
        this.name = '';
    }
    ContinuationSegment.prototype.generate = function (params) { return ''; };
    ContinuationSegment.prototype.match = function (path) { return true; };
    return ContinuationSegment;
})();
var StaticSegment = (function () {
    function StaticSegment(path) {
        this.path = path;
        this.name = '';
    }
    StaticSegment.prototype.match = function (path) { return path == this.path; };
    StaticSegment.prototype.generate = function (params) { return this.path; };
    return StaticSegment;
})();
var DynamicSegment = (function () {
    function DynamicSegment(name) {
        this.name = name;
    }
    DynamicSegment.prototype.match = function (path) { return path.length > 0; };
    DynamicSegment.prototype.generate = function (params) {
        if (!collection_1.StringMapWrapper.contains(params.map, this.name)) {
            throw new exceptions_1.BaseException("Route generator for '" + this.name + "' was not included in parameters passed.");
        }
        return normalizeString(params.get(this.name));
    };
    return DynamicSegment;
})();
var StarSegment = (function () {
    function StarSegment(name) {
        this.name = name;
    }
    StarSegment.prototype.match = function (path) { return true; };
    StarSegment.prototype.generate = function (params) { return normalizeString(params.get(this.name)); };
    return StarSegment;
})();
var paramMatcher = /^:([^\/]+)$/g;
var wildcardMatcher = /^\*([^\/]+)$/g;
function parsePathString(route) {
    // normalize route as not starting with a "/". Recognition will
    // also normalize.
    if (route.startsWith("/")) {
        route = route.substring(1);
    }
    var segments = splitBySlash(route);
    var results = [];
    var specificity = 0;
    // The "specificity" of a path is used to determine which route is used when multiple routes match
    // a URL.
    // Static segments (like "/foo") are the most specific, followed by dynamic segments (like
    // "/:id"). Star segments
    // add no specificity. Segments at the start of the path are more specific than proceeding ones.
    // The code below uses place values to combine the different types of segments into a single
    // integer that we can
    // sort later. Each static segment is worth hundreds of points of specificity (10000, 9900, ...,
    // 200), and each
    // dynamic segment is worth single points of specificity (100, 99, ... 2).
    if (segments.length > 98) {
        throw new exceptions_1.BaseException("'" + route + "' has more than the maximum supported number of segments.");
    }
    var limit = segments.length - 1;
    for (var i = 0; i <= limit; i++) {
        var segment = segments[i], match;
        if (lang_1.isPresent(match = lang_1.RegExpWrapper.firstMatch(paramMatcher, segment))) {
            results.push(new DynamicSegment(match[1]));
            specificity += (100 - i);
        }
        else if (lang_1.isPresent(match = lang_1.RegExpWrapper.firstMatch(wildcardMatcher, segment))) {
            results.push(new StarSegment(match[1]));
        }
        else if (segment == '...') {
            if (i < limit) {
                throw new exceptions_1.BaseException("Unexpected \"...\" before the end of the path for \"" + route + "\".");
            }
            results.push(new ContinuationSegment());
        }
        else {
            results.push(new StaticSegment(segment));
            specificity += 100 * (100 - i);
        }
    }
    var result = collection_1.StringMapWrapper.create();
    collection_1.StringMapWrapper.set(result, 'segments', results);
    collection_1.StringMapWrapper.set(result, 'specificity', specificity);
    return result;
}
// this function is used to determine whether a route config path like `/foo/:id` collides with
// `/foo/:name`
function pathDslHash(segments) {
    return segments.map(function (segment) {
        if (segment instanceof StarSegment) {
            return '*';
        }
        else if (segment instanceof ContinuationSegment) {
            return '...';
        }
        else if (segment instanceof DynamicSegment) {
            return ':';
        }
        else if (segment instanceof StaticSegment) {
            return segment.path;
        }
    })
        .join('/');
}
function splitBySlash(url) {
    return url.split('/');
}
var RESERVED_CHARS = lang_1.RegExpWrapper.create('//|\\(|\\)|;|\\?|=');
function assertPath(path) {
    if (lang_1.StringWrapper.contains(path, '#')) {
        throw new exceptions_1.BaseException("Path \"" + path + "\" should not include \"#\". Use \"HashLocationStrategy\" instead.");
    }
    var illegalCharacter = lang_1.RegExpWrapper.firstMatch(RESERVED_CHARS, path);
    if (lang_1.isPresent(illegalCharacter)) {
        throw new exceptions_1.BaseException("Path \"" + path + "\" contains \"" + illegalCharacter[0] + "\" which is not allowed in a route config.");
    }
}
/**
 * Parses a URL string using a given matcher DSL, and generates URLs from param maps
 */
var PathRecognizer = (function () {
    function PathRecognizer(path) {
        this.path = path;
        this.terminal = true;
        assertPath(path);
        var parsed = parsePathString(path);
        this._segments = parsed['segments'];
        this.specificity = parsed['specificity'];
        this.hash = pathDslHash(this._segments);
        var lastSegment = this._segments[this._segments.length - 1];
        this.terminal = !(lastSegment instanceof ContinuationSegment);
    }
    PathRecognizer.prototype.recognize = function (beginningSegment) {
        var nextSegment = beginningSegment;
        var currentSegment;
        var positionalParams = {};
        var captured = [];
        for (var i = 0; i < this._segments.length; i += 1) {
            var segment = this._segments[i];
            currentSegment = nextSegment;
            if (segment instanceof ContinuationSegment) {
                break;
            }
            if (lang_1.isPresent(currentSegment)) {
                captured.push(currentSegment.path);
                // the star segment consumes all of the remaining URL, including matrix params
                if (segment instanceof StarSegment) {
                    positionalParams[segment.name] = currentSegment.toString();
                    nextSegment = null;
                    break;
                }
                if (segment instanceof DynamicSegment) {
                    positionalParams[segment.name] = currentSegment.path;
                }
                else if (!segment.match(currentSegment.path)) {
                    return null;
                }
                nextSegment = currentSegment.child;
            }
            else if (!segment.match('')) {
                return null;
            }
        }
        if (this.terminal && lang_1.isPresent(nextSegment)) {
            return null;
        }
        var urlPath = captured.join('/');
        var auxiliary;
        var urlParams;
        var allParams;
        if (lang_1.isPresent(currentSegment)) {
            // If this is the root component, read query params. Otherwise, read matrix params.
            var paramsSegment = beginningSegment instanceof url_parser_1.RootUrl ? beginningSegment : currentSegment;
            allParams = lang_1.isPresent(paramsSegment.params) ?
                collection_1.StringMapWrapper.merge(paramsSegment.params, positionalParams) :
                positionalParams;
            urlParams = url_parser_1.serializeParams(paramsSegment.params);
            auxiliary = currentSegment.auxiliary;
        }
        else {
            allParams = positionalParams;
            auxiliary = [];
            urlParams = [];
        }
        return { urlPath: urlPath, urlParams: urlParams, allParams: allParams, auxiliary: auxiliary, nextSegment: nextSegment };
    };
    PathRecognizer.prototype.generate = function (params) {
        var paramTokens = new TouchMap(params);
        var path = [];
        for (var i = 0; i < this._segments.length; i++) {
            var segment = this._segments[i];
            if (!(segment instanceof ContinuationSegment)) {
                path.push(segment.generate(paramTokens));
            }
        }
        var urlPath = path.join('/');
        var nonPositionalParams = paramTokens.getUnused();
        var urlParams = url_parser_1.serializeParams(nonPositionalParams);
        return { urlPath: urlPath, urlParams: urlParams };
    };
    return PathRecognizer;
})();
exports.PathRecognizer = PathRecognizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aF9yZWNvZ25pemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3JvdXRlci9wYXRoX3JlY29nbml6ZXIudHMiXSwibmFtZXMiOlsiVG91Y2hNYXAiLCJUb3VjaE1hcC5jb25zdHJ1Y3RvciIsIlRvdWNoTWFwLmdldCIsIlRvdWNoTWFwLmdldFVudXNlZCIsIm5vcm1hbGl6ZVN0cmluZyIsIkNvbnRpbnVhdGlvblNlZ21lbnQiLCJDb250aW51YXRpb25TZWdtZW50LmNvbnN0cnVjdG9yIiwiQ29udGludWF0aW9uU2VnbWVudC5nZW5lcmF0ZSIsIkNvbnRpbnVhdGlvblNlZ21lbnQubWF0Y2giLCJTdGF0aWNTZWdtZW50IiwiU3RhdGljU2VnbWVudC5jb25zdHJ1Y3RvciIsIlN0YXRpY1NlZ21lbnQubWF0Y2giLCJTdGF0aWNTZWdtZW50LmdlbmVyYXRlIiwiRHluYW1pY1NlZ21lbnQiLCJEeW5hbWljU2VnbWVudC5jb25zdHJ1Y3RvciIsIkR5bmFtaWNTZWdtZW50Lm1hdGNoIiwiRHluYW1pY1NlZ21lbnQuZ2VuZXJhdGUiLCJTdGFyU2VnbWVudCIsIlN0YXJTZWdtZW50LmNvbnN0cnVjdG9yIiwiU3RhclNlZ21lbnQubWF0Y2giLCJTdGFyU2VnbWVudC5nZW5lcmF0ZSIsInBhcnNlUGF0aFN0cmluZyIsInBhdGhEc2xIYXNoIiwic3BsaXRCeVNsYXNoIiwiYXNzZXJ0UGF0aCIsIlBhdGhSZWNvZ25pemVyIiwiUGF0aFJlY29nbml6ZXIuY29uc3RydWN0b3IiLCJQYXRoUmVjb2duaXplci5yZWNvZ25pemUiLCJQYXRoUmVjb2duaXplci5nZW5lcmF0ZSJdLCJtYXBwaW5ncyI6IkFBQUEscUJBT08sMEJBQTBCLENBQUMsQ0FBQTtBQUNsQywyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUMvRSwyQkFBZ0QsZ0NBQWdDLENBQUMsQ0FBQTtBQUVqRiwyQkFBNEMsY0FBYyxDQUFDLENBQUE7QUFFM0Q7SUFJRUEsa0JBQVlBLEdB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eHBNYXRjaGVyV3JhcHBlcixcbiAgU3RyaW5nV3JhcHBlcixcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge01hcCwgTWFwV3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0IHtVcmwsIFJvb3RVcmwsIHNlcmlhbGl6ZVBhcmFtc30gZnJvbSAnLi91cmxfcGFyc2VyJztcblxuY2xhc3MgVG91Y2hNYXAge1xuICBtYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gIGtleXM6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKG1hcDoge1trZXk6IHN0cmluZ106IGFueX0pIHtcbiAgICBpZiAoaXNQcmVzZW50KG1hcCkpIHtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChtYXAsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgIHRoaXMubWFwW2tleV0gPSBpc1ByZXNlbnQodmFsdWUpID8gdmFsdWUudG9TdHJpbmcoKSA6IG51bGw7XG4gICAgICAgIHRoaXMua2V5c1trZXldID0gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGdldChrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5kZWxldGUodGhpcy5rZXlzLCBrZXkpO1xuICAgIHJldHVybiB0aGlzLm1hcFtrZXldO1xuICB9XG5cbiAgZ2V0VW51c2VkKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICB2YXIgdW51c2VkOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuICAgIHZhciBrZXlzID0gU3RyaW5nTWFwV3JhcHBlci5rZXlzKHRoaXMua2V5cyk7XG4gICAga2V5cy5mb3JFYWNoKGtleSA9PiB1bnVzZWRba2V5XSA9IFN0cmluZ01hcFdyYXBwZXIuZ2V0KHRoaXMubWFwLCBrZXkpKTtcbiAgICByZXR1cm4gdW51c2VkO1xuICB9XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVN0cmluZyhvYmo6IGFueSk6IHN0cmluZyB7XG4gIGlmIChpc0JsYW5rKG9iaikpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb2JqLnRvU3RyaW5nKCk7XG4gIH1cbn1cblxuaW50ZXJmYWNlIFNlZ21lbnQge1xuICBuYW1lOiBzdHJpbmc7XG4gIGdlbmVyYXRlKHBhcmFtczogVG91Y2hNYXApOiBzdHJpbmc7XG4gIG1hdGNoKHBhdGg6IHN0cmluZyk6IGJvb2xlYW47XG59XG5cbmNsYXNzIENvbnRpbnVhdGlvblNlZ21lbnQgaW1wbGVtZW50cyBTZWdtZW50IHtcbiAgbmFtZTogc3RyaW5nID0gJyc7XG4gIGdlbmVyYXRlKHBhcmFtczogVG91Y2hNYXApOiBzdHJpbmcgeyByZXR1cm4gJyc7IH1cbiAgbWF0Y2gocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiB0cnVlOyB9XG59XG5cbmNsYXNzIFN0YXRpY1NlZ21lbnQgaW1wbGVtZW50cyBTZWdtZW50IHtcbiAgbmFtZTogc3RyaW5nID0gJyc7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwYXRoOiBzdHJpbmcpIHt9XG4gIG1hdGNoKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gcGF0aCA9PSB0aGlzLnBhdGg7IH1cbiAgZ2VuZXJhdGUocGFyYW1zOiBUb3VjaE1hcCk6IHN0cmluZyB7IHJldHVybiB0aGlzLnBhdGg7IH1cbn1cblxuY2xhc3MgRHluYW1pY1NlZ21lbnQgaW1wbGVtZW50cyBTZWdtZW50IHtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZykge31cbiAgbWF0Y2gocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiBwYXRoLmxlbmd0aCA+IDA7IH1cbiAgZ2VuZXJhdGUocGFyYW1zOiBUb3VjaE1hcCk6IHN0cmluZyB7XG4gICAgaWYgKCFTdHJpbmdNYXBXcmFwcGVyLmNvbnRhaW5zKHBhcmFtcy5tYXAsIHRoaXMubmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBSb3V0ZSBnZW5lcmF0b3IgZm9yICcke3RoaXMubmFtZX0nIHdhcyBub3QgaW5jbHVkZWQgaW4gcGFyYW1ldGVycyBwYXNzZWQuYCk7XG4gICAgfVxuICAgIHJldHVybiBub3JtYWxpemVTdHJpbmcocGFyYW1zLmdldCh0aGlzLm5hbWUpKTtcbiAgfVxufVxuXG5cbmNsYXNzIFN0YXJTZWdtZW50IGltcGxlbWVudHMgU2VnbWVudCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcpIHt9XG4gIG1hdGNoKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuICBnZW5lcmF0ZShwYXJhbXM6IFRvdWNoTWFwKTogc3RyaW5nIHsgcmV0dXJuIG5vcm1hbGl6ZVN0cmluZyhwYXJhbXMuZ2V0KHRoaXMubmFtZSkpOyB9XG59XG5cblxudmFyIHBhcmFtTWF0Y2hlciA9IC9eOihbXlxcL10rKSQvZztcbnZhciB3aWxkY2FyZE1hdGNoZXIgPSAvXlxcKihbXlxcL10rKSQvZztcblxuZnVuY3Rpb24gcGFyc2VQYXRoU3RyaW5nKHJvdXRlOiBzdHJpbmcpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIC8vIG5vcm1hbGl6ZSByb3V0ZSBhcyBub3Qgc3RhcnRpbmcgd2l0aCBhIFwiL1wiLiBSZWNvZ25pdGlvbiB3aWxsXG4gIC8vIGFsc28gbm9ybWFsaXplLlxuICBpZiAocm91dGUuc3RhcnRzV2l0aChcIi9cIikpIHtcbiAgICByb3V0ZSA9IHJvdXRlLnN1YnN0cmluZygxKTtcbiAgfVxuXG4gIHZhciBzZWdtZW50cyA9IHNwbGl0QnlTbGFzaChyb3V0ZSk7XG4gIHZhciByZXN1bHRzID0gW107XG4gIHZhciBzcGVjaWZpY2l0eSA9IDA7XG5cbiAgLy8gVGhlIFwic3BlY2lmaWNpdHlcIiBvZiBhIHBhdGggaXMgdXNlZCB0byBkZXRlcm1pbmUgd2hpY2ggcm91dGUgaXMgdXNlZCB3aGVuIG11bHRpcGxlIHJvdXRlcyBtYXRjaFxuICAvLyBhIFVSTC5cbiAgLy8gU3RhdGljIHNlZ21lbnRzIChsaWtlIFwiL2Zvb1wiKSBhcmUgdGhlIG1vc3Qgc3BlY2lmaWMsIGZvbGxvd2VkIGJ5IGR5bmFtaWMgc2VnbWVudHMgKGxpa2VcbiAgLy8gXCIvOmlkXCIpLiBTdGFyIHNlZ21lbnRzXG4gIC8vIGFkZCBubyBzcGVjaWZpY2l0eS4gU2VnbWVudHMgYXQgdGhlIHN0YXJ0IG9mIHRoZSBwYXRoIGFyZSBtb3JlIHNwZWNpZmljIHRoYW4gcHJvY2VlZGluZyBvbmVzLlxuICAvLyBUaGUgY29kZSBiZWxvdyB1c2VzIHBsYWNlIHZhbHVlcyB0byBjb21iaW5lIHRoZSBkaWZmZXJlbnQgdHlwZXMgb2Ygc2VnbWVudHMgaW50byBhIHNpbmdsZVxuICAvLyBpbnRlZ2VyIHRoYXQgd2UgY2FuXG4gIC8vIHNvcnQgbGF0ZXIuIEVhY2ggc3RhdGljIHNlZ21lbnQgaXMgd29ydGggaHVuZHJlZHMgb2YgcG9pbnRzIG9mIHNwZWNpZmljaXR5ICgxMDAwMCwgOTkwMCwgLi4uLFxuICAvLyAyMDApLCBhbmQgZWFjaFxuICAvLyBkeW5hbWljIHNlZ21lbnQgaXMgd29ydGggc2luZ2xlIHBvaW50cyBvZiBzcGVjaWZpY2l0eSAoMTAwLCA5OSwgLi4uIDIpLlxuICBpZiAoc2VnbWVudHMubGVuZ3RoID4gOTgpIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgJyR7cm91dGV9JyBoYXMgbW9yZSB0aGFuIHRoZSBtYXhpbXVtIHN1cHBvcnRlZCBudW1iZXIgb2Ygc2VnbWVudHMuYCk7XG4gIH1cblxuICB2YXIgbGltaXQgPSBzZWdtZW50cy5sZW5ndGggLSAxO1xuICBmb3IgKHZhciBpID0gMDsgaSA8PSBsaW1pdDsgaSsrKSB7XG4gICAgdmFyIHNlZ21lbnQgPSBzZWdtZW50c1tpXSwgbWF0Y2g7XG5cbiAgICBpZiAoaXNQcmVzZW50KG1hdGNoID0gUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKHBhcmFtTWF0Y2hlciwgc2VnbWVudCkpKSB7XG4gICAgICByZXN1bHRzLnB1c2gobmV3IER5bmFtaWNTZWdtZW50KG1hdGNoWzFdKSk7XG4gICAgICBzcGVjaWZpY2l0eSArPSAoMTAwIC0gaSk7XG4gICAgfSBlbHNlIGlmIChpc1ByZXNlbnQobWF0Y2ggPSBSZWdFeHBXcmFwcGVyLmZpcnN0TWF0Y2god2lsZGNhcmRNYXRjaGVyLCBzZWdtZW50KSkpIHtcbiAgICAgIHJlc3VsdHMucHVzaChuZXcgU3RhclNlZ21lbnQobWF0Y2hbMV0pKTtcbiAgICB9IGVsc2UgaWYgKHNlZ21lbnQgPT0gJy4uLicpIHtcbiAgICAgIGlmIChpIDwgbGltaXQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYFVuZXhwZWN0ZWQgXCIuLi5cIiBiZWZvcmUgdGhlIGVuZCBvZiB0aGUgcGF0aCBmb3IgXCIke3JvdXRlfVwiLmApO1xuICAgICAgfVxuICAgICAgcmVzdWx0cy5wdXNoKG5ldyBDb250aW51YXRpb25TZWdtZW50KCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRzLnB1c2gobmV3IFN0YXRpY1NlZ21lbnQoc2VnbWVudCkpO1xuICAgICAgc3BlY2lmaWNpdHkgKz0gMTAwICogKDEwMCAtIGkpO1xuICAgIH1cbiAgfVxuICB2YXIgcmVzdWx0ID0gU3RyaW5nTWFwV3JhcHBlci5jcmVhdGUoKTtcbiAgU3RyaW5nTWFwV3JhcHBlci5zZXQocmVzdWx0LCAnc2VnbWVudHMnLCByZXN1bHRzKTtcbiAgU3RyaW5nTWFwV3JhcHBlci5zZXQocmVzdWx0LCAnc3BlY2lmaWNpdHknLCBzcGVjaWZpY2l0eSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIHRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciBhIHJvdXRlIGNvbmZpZyBwYXRoIGxpa2UgYC9mb28vOmlkYCBjb2xsaWRlcyB3aXRoXG4vLyBgL2Zvby86bmFtZWBcbmZ1bmN0aW9uIHBhdGhEc2xIYXNoKHNlZ21lbnRzOiBTZWdtZW50W10pOiBzdHJpbmcge1xuICByZXR1cm4gc2VnbWVudHMubWFwKChzZWdtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgaWYgKHNlZ21lbnQgaW5zdGFuY2VvZiBTdGFyU2VnbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcqJztcbiAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNlZ21lbnQgaW5zdGFuY2VvZiBDb250aW51YXRpb25TZWdtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy4uLic7XG4gICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzZWdtZW50IGluc3RhbmNlb2YgRHluYW1pY1NlZ21lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnOic7XG4gICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzZWdtZW50IGluc3RhbmNlb2YgU3RhdGljU2VnbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlZ21lbnQucGF0aDtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgIH0pXG4gICAgICAuam9pbignLycpO1xufVxuXG5mdW5jdGlvbiBzcGxpdEJ5U2xhc2godXJsOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIHJldHVybiB1cmwuc3BsaXQoJy8nKTtcbn1cblxudmFyIFJFU0VSVkVEX0NIQVJTID0gUmVnRXhwV3JhcHBlci5jcmVhdGUoJy8vfFxcXFwofFxcXFwpfDt8XFxcXD98PScpO1xuZnVuY3Rpb24gYXNzZXJ0UGF0aChwYXRoOiBzdHJpbmcpIHtcbiAgaWYgKFN0cmluZ1dyYXBwZXIuY29udGFpbnMocGF0aCwgJyMnKSkge1xuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICBgUGF0aCBcIiR7cGF0aH1cIiBzaG91bGQgbm90IGluY2x1ZGUgXCIjXCIuIFVzZSBcIkhhc2hMb2NhdGlvblN0cmF0ZWd5XCIgaW5zdGVhZC5gKTtcbiAgfVxuICB2YXIgaWxsZWdhbENoYXJhY3RlciA9IFJlZ0V4cFdyYXBwZXIuZmlyc3RNYXRjaChSRVNFUlZFRF9DSEFSUywgcGF0aCk7XG4gIGlmIChpc1ByZXNlbnQoaWxsZWdhbENoYXJhY3RlcikpIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgYFBhdGggXCIke3BhdGh9XCIgY29udGFpbnMgXCIke2lsbGVnYWxDaGFyYWN0ZXJbMF19XCIgd2hpY2ggaXMgbm90IGFsbG93ZWQgaW4gYSByb3V0ZSBjb25maWcuYCk7XG4gIH1cbn1cblxuXG4vKipcbiAqIFBhcnNlcyBhIFVSTCBzdHJpbmcgdXNpbmcgYSBnaXZlbiBtYXRjaGVyIERTTCwgYW5kIGdlbmVyYXRlcyBVUkxzIGZyb20gcGFyYW0gbWFwc1xuICovXG5leHBvcnQgY2xhc3MgUGF0aFJlY29nbml6ZXIge1xuICBwcml2YXRlIF9zZWdtZW50czogU2VnbWVudFtdO1xuICBzcGVjaWZpY2l0eTogbnVtYmVyO1xuICB0ZXJtaW5hbDogYm9vbGVhbiA9IHRydWU7XG4gIGhhc2g6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGF0aDogc3RyaW5nKSB7XG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcbiAgICB2YXIgcGFyc2VkID0gcGFyc2VQYXRoU3RyaW5nKHBhdGgpO1xuXG4gICAgdGhpcy5fc2VnbWVudHMgPSBwYXJzZWRbJ3NlZ21lbnRzJ107XG4gICAgdGhpcy5zcGVjaWZpY2l0eSA9IHBhcnNlZFsnc3BlY2lmaWNpdHknXTtcbiAgICB0aGlzLmhhc2ggPSBwYXRoRHNsSGFzaCh0aGlzLl9zZWdtZW50cyk7XG5cbiAgICB2YXIgbGFzdFNlZ21lbnQgPSB0aGlzLl9zZWdtZW50c1t0aGlzLl9zZWdtZW50cy5sZW5ndGggLSAxXTtcbiAgICB0aGlzLnRlcm1pbmFsID0gIShsYXN0U2VnbWVudCBpbnN0YW5jZW9mIENvbnRpbnVhdGlvblNlZ21lbnQpO1xuICB9XG5cbiAgcmVjb2duaXplKGJlZ2lubmluZ1NlZ21lbnQ6IFVybCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICB2YXIgbmV4dFNlZ21lbnQgPSBiZWdpbm5pbmdTZWdtZW50O1xuICAgIHZhciBjdXJyZW50U2VnbWVudDogVXJsO1xuICAgIHZhciBwb3NpdGlvbmFsUGFyYW1zID0ge307XG4gICAgdmFyIGNhcHR1cmVkID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3NlZ21lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB2YXIgc2VnbWVudCA9IHRoaXMuX3NlZ21lbnRzW2ldO1xuXG4gICAgICBjdXJyZW50U2VnbWVudCA9IG5leHRTZWdtZW50O1xuICAgICAgaWYgKHNlZ21lbnQgaW5zdGFuY2VvZiBDb250aW51YXRpb25TZWdtZW50KSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNQcmVzZW50KGN1cnJlbnRTZWdtZW50KSkge1xuICAgICAgICBjYXB0dXJlZC5wdXNoKGN1cnJlbnRTZWdtZW50LnBhdGgpO1xuXG4gICAgICAgIC8vIHRoZSBzdGFyIHNlZ21lbnQgY29uc3VtZXMgYWxsIG9mIHRoZSByZW1haW5pbmcgVVJMLCBpbmNsdWRpbmcgbWF0cml4IHBhcmFtc1xuICAgICAgICBpZiAoc2VnbWVudCBpbnN0YW5jZW9mIFN0YXJTZWdtZW50KSB7XG4gICAgICAgICAgcG9zaXRpb25hbFBhcmFtc1tzZWdtZW50Lm5hbWVdID0gY3VycmVudFNlZ21lbnQudG9TdHJpbmcoKTtcbiAgICAgICAgICBuZXh0U2VnbWVudCA9IG51bGw7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VnbWVudCBpbnN0YW5jZW9mIER5bmFtaWNTZWdtZW50KSB7XG4gICAgICAgICAgcG9zaXRpb25hbFBhcmFtc1tzZWdtZW50Lm5hbWVdID0gY3VycmVudFNlZ21lbnQucGF0aDtcbiAgICAgICAgfSBlbHNlIGlmICghc2VnbWVudC5tYXRjaChjdXJyZW50U2VnbWVudC5wYXRoKSkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV4dFNlZ21lbnQgPSBjdXJyZW50U2VnbWVudC5jaGlsZDtcbiAgICAgIH0gZWxzZSBpZiAoIXNlZ21lbnQubWF0Y2goJycpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLnRlcm1pbmFsICYmIGlzUHJlc2VudChuZXh0U2VnbWVudCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciB1cmxQYXRoID0gY2FwdHVyZWQuam9pbignLycpO1xuXG4gICAgdmFyIGF1eGlsaWFyeTtcbiAgICB2YXIgdXJsUGFyYW1zO1xuICAgIHZhciBhbGxQYXJhbXM7XG4gICAgaWYgKGlzUHJlc2VudChjdXJyZW50U2VnbWVudCkpIHtcbiAgICAgIC8vIElmIHRoaXMgaXMgdGhlIHJvb3QgY29tcG9uZW50LCByZWFkIHF1ZXJ5IHBhcmFtcy4gT3RoZXJ3aXNlLCByZWFkIG1hdHJpeCBwYXJhbXMuXG4gICAgICB2YXIgcGFyYW1zU2VnbWVudCA9IGJlZ2lubmluZ1NlZ21lbnQgaW5zdGFuY2VvZiBSb290VXJsID8gYmVnaW5uaW5nU2VnbWVudCA6IGN1cnJlbnRTZWdtZW50O1xuXG4gICAgICBhbGxQYXJhbXMgPSBpc1ByZXNlbnQocGFyYW1zU2VnbWVudC5wYXJhbXMpID9cbiAgICAgICAgICAgICAgICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLm1lcmdlKHBhcmFtc1NlZ21lbnQucGFyYW1zLCBwb3NpdGlvbmFsUGFyYW1zKSA6XG4gICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25hbFBhcmFtcztcblxuICAgICAgdXJsUGFyYW1zID0gc2VyaWFsaXplUGFyYW1zKHBhcmFtc1NlZ21lbnQucGFyYW1zKTtcblxuXG4gICAgICBhdXhpbGlhcnkgPSBjdXJyZW50U2VnbWVudC5hdXhpbGlhcnk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFsbFBhcmFtcyA9IHBvc2l0aW9uYWxQYXJhbXM7XG4gICAgICBhdXhpbGlhcnkgPSBbXTtcbiAgICAgIHVybFBhcmFtcyA9IFtdO1xuICAgIH1cbiAgICByZXR1cm4ge3VybFBhdGgsIHVybFBhcmFtcywgYWxsUGFyYW1zLCBhdXhpbGlhcnksIG5leHRTZWdtZW50fTtcbiAgfVxuXG5cbiAgZ2VuZXJhdGUocGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICB2YXIgcGFyYW1Ub2tlbnMgPSBuZXcgVG91Y2hNYXAocGFyYW1zKTtcblxuICAgIHZhciBwYXRoID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3NlZ21lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgc2VnbWVudCA9IHRoaXMuX3NlZ21lbnRzW2ldO1xuICAgICAgaWYgKCEoc2VnbWVudCBpbnN0YW5jZW9mIENvbnRpbnVhdGlvblNlZ21lbnQpKSB7XG4gICAgICAgIHBhdGgucHVzaChzZWdtZW50LmdlbmVyYXRlKHBhcmFtVG9rZW5zKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciB1cmxQYXRoID0gcGF0aC5qb2luKCcvJyk7XG5cbiAgICB2YXIgbm9uUG9zaXRpb25hbFBhcmFtcyA9IHBhcmFtVG9rZW5zLmdldFVudXNlZCgpO1xuICAgIHZhciB1cmxQYXJhbXMgPSBzZXJpYWxpemVQYXJhbXMobm9uUG9zaXRpb25hbFBhcmFtcyk7XG5cbiAgICByZXR1cm4ge3VybFBhdGgsIHVybFBhcmFtc307XG4gIH1cbn1cbiJdfQ==