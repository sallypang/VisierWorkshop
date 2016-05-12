'use strict';var core_1 = require('angular2/core');
var animation_builder_1 = require('angular2/src/animate/animation_builder');
var animation_builder_mock_1 = require('angular2/src/mock/animation_builder_mock');
var proto_view_factory_1 = require('angular2/src/core/linker/proto_view_factory');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var exceptions_1 = require('angular2/src/facade/exceptions');
var pipe_resolver_1 = require('angular2/src/core/linker/pipe_resolver');
var xhr_1 = require('angular2/src/compiler/xhr');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var directive_resolver_mock_1 = require('angular2/src/mock/directive_resolver_mock');
var view_resolver_mock_1 = require('angular2/src/mock/view_resolver_mock');
var mock_location_strategy_1 = require('angular2/src/mock/mock_location_strategy');
var location_strategy_1 = require('angular2/src/router/location_strategy');
var ng_zone_mock_1 = require('angular2/src/mock/ng_zone_mock');
var test_component_builder_1 = require('./test_component_builder');
var common_dom_1 = require('angular2/platform/common_dom');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var view_pool_1 = require('angular2/src/core/linker/view_pool');
var view_manager_utils_1 = require('angular2/src/core/linker/view_manager_utils');
var dom_tokens_1 = require('angular2/src/platform/dom/dom_tokens');
var dom_renderer_1 = require('angular2/src/platform/dom/dom_renderer');
var shared_styles_host_1 = require('angular2/src/platform/dom/shared_styles_host');
var shared_styles_host_2 = require('angular2/src/platform/dom/shared_styles_host');
var dom_events_1 = require('angular2/src/platform/dom/events/dom_events');
var serializer_1 = require("angular2/src/web_workers/shared/serializer");
var utils_1 = require('./utils');
var compiler_1 = require('angular2/src/compiler/compiler');
var dom_renderer_2 = require("angular2/src/platform/dom/dom_renderer");
var dynamic_component_loader_1 = require("angular2/src/core/linker/dynamic_component_loader");
var view_manager_1 = require("angular2/src/core/linker/view_manager");
/**
 * Returns the root injector providers.
 *
 * This must be kept in sync with the _rootBindings in application.js
 *
 * @returns {any[]}
 */
function _getRootProviders() {
    return [core_1.provide(reflection_1.Reflector, { useValue: reflection_1.reflector })];
}
/**
 * Returns the application injector providers.
 *
 * This must be kept in sync with _injectorBindings() in application.js
 *
 * @returns {any[]}
 */
function _getAppBindings() {
    var appDoc;
    // The document is only available in browser environment
    try {
        appDoc = dom_adapter_1.DOM.defaultDoc();
    }
    catch (e) {
        appDoc = null;
    }
    return [
        core_1.APPLICATION_COMMON_PROVIDERS,
        core_1.provide(change_detection_1.ChangeDetectorGenConfig, { useValue: new change_detection_1.ChangeDetectorGenConfig(true, false, true) }),
        core_1.provide(dom_tokens_1.DOCUMENT, { useValue: appDoc }),
        core_1.provide(dom_renderer_1.DomRenderer, { useClass: dom_renderer_2.DomRenderer_ }),
        core_1.provide(core_1.Renderer, { useExisting: dom_renderer_1.DomRenderer }),
        core_1.provide(core_1.APP_ID, { useValue: 'a' }),
        shared_styles_host_1.DomSharedStylesHost,
        core_1.provide(shared_styles_host_2.SharedStylesHost, { useExisting: shared_styles_host_1.DomSharedStylesHost }),
        view_pool_1.AppViewPool,
        core_1.provide(core_1.AppViewManager, { useClass: view_manager_1.AppViewManager_ }),
        view_manager_utils_1.AppViewManagerUtils,
        serializer_1.Serializer,
        common_dom_1.ELEMENT_PROBE_PROVIDERS,
        core_1.provide(view_pool_1.APP_VIEW_POOL_CAPACITY, { useValue: 500 }),
        proto_view_factory_1.ProtoViewFactory,
        core_1.provide(core_1.DirectiveResolver, { useClass: directive_resolver_mock_1.MockDirectiveResolver }),
        core_1.provide(core_1.ViewResolver, { useClass: view_resolver_mock_1.MockViewResolver }),
        core_1.provide(change_detection_1.IterableDiffers, { useValue: change_detection_1.defaultIterableDiffers }),
        core_1.provide(change_detection_1.KeyValueDiffers, { useValue: change_detection_1.defaultKeyValueDiffers }),
        utils_1.Log,
        core_1.provide(core_1.DynamicComponentLoader, { useClass: dynamic_component_loader_1.DynamicComponentLoader_ }),
        pipe_resolver_1.PipeResolver,
        core_1.provide(exceptions_1.ExceptionHandler, { useValue: new exceptions_1.ExceptionHandler(dom_adapter_1.DOM) }),
        core_1.provide(location_strategy_1.LocationStrategy, { useClass: mock_location_strategy_1.MockLocationStrategy }),
        core_1.provide(xhr_1.XHR, { useClass: dom_adapter_1.DOM.getXHR() }),
        test_component_builder_1.TestComponentBuilder,
        core_1.provide(core_1.NgZone, { useClass: ng_zone_mock_1.MockNgZone }),
        core_1.provide(animation_builder_1.AnimationBuilder, { useClass: animation_builder_mock_1.MockAnimationBuilder }),
        common_dom_1.EventManager,
        new core_1.Provider(common_dom_1.EVENT_MANAGER_PLUGINS, { useClass: dom_events_1.DomEventsPlugin, multi: true })
    ];
}
function _runtimeCompilerBindings() {
    return [
        core_1.provide(xhr_1.XHR, { useClass: dom_adapter_1.DOM.getXHR() }),
        compiler_1.COMPILER_PROVIDERS,
    ];
}
function createTestInjector(providers) {
    var rootInjector = core_1.Injector.resolveAndCreate(_getRootProviders());
    return rootInjector.resolveAndCreateChild(collection_1.ListWrapper.concat(_getAppBindings(), providers));
}
exports.createTestInjector = createTestInjector;
function createTestInjectorWithRuntimeCompiler(providers) {
    return createTestInjector(collection_1.ListWrapper.concat(_runtimeCompilerBindings(), providers));
}
exports.createTestInjectorWithRuntimeCompiler = createTestInjectorWithRuntimeCompiler;
/**
 * Allows injecting dependencies in `beforeEach()` and `it()`.
 *
 * Example:
 *
 * ```
 * beforeEach(inject([Dependency, AClass], (dep, object) => {
 *   // some code that uses `dep` and `object`
 *   // ...
 * }));
 *
 * it('...', inject([AClass], (object) => {
 *   object.doSomething();
 *   expect(...);
 * })
 * ```
 *
 * Notes:
 * - inject is currently a function because of some Traceur limitation the syntax should eventually
 *   becomes `it('...', @Inject (object: AClass, async: AsyncTestCompleter) => { ... });`
 *
 * @param {Array} tokens
 * @param {Function} fn
 * @return {FunctionWithParamTokens}
 */
function inject(tokens, fn) {
    return new FunctionWithParamTokens(tokens, fn, false);
}
exports.inject = inject;
/**
 * Allows injecting dependencies in `beforeEach()` and `it()`. The test must return
 * a promise which will resolve when all asynchronous activity is complete.
 *
 * Example:
 *
 * ```
 * it('...', injectAsync([AClass], (object) => {
 *   return object.doSomething().then(() => {
 *     expect(...);
 *   });
 * })
 * ```
 *
 * @param {Array} tokens
 * @param {Function} fn
 * @return {FunctionWithParamTokens}
 */
function injectAsync(tokens, fn) {
    return new FunctionWithParamTokens(tokens, fn, true);
}
exports.injectAsync = injectAsync;
var FunctionWithParamTokens = (function () {
    function FunctionWithParamTokens(_tokens, _fn, isAsync) {
        this._tokens = _tokens;
        this._fn = _fn;
        this.isAsync = isAsync;
    }
    /**
     * Returns the value of the executed function.
     */
    FunctionWithParamTokens.prototype.execute = function (injector) {
        var params = this._tokens.map(function (t) { return injector.get(t); });
        return lang_1.FunctionWrapper.apply(this._fn, params);
    };
    FunctionWithParamTokens.prototype.hasToken = function (token) { return this._tokens.indexOf(token) > -1; };
    return FunctionWithParamTokens;
})();
exports.FunctionWithParamTokens = FunctionWithParamTokens;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9pbmplY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfaW5qZWN0b3IudHMiXSwibmFtZXMiOlsiX2dldFJvb3RQcm92aWRlcnMiLCJfZ2V0QXBwQmluZGluZ3MiLCJfcnVudGltZUNvbXBpbGVyQmluZGluZ3MiLCJjcmVhdGVUZXN0SW5qZWN0b3IiLCJjcmVhdGVUZXN0SW5qZWN0b3JXaXRoUnVudGltZUNvbXBpbGVyIiwiaW5qZWN0IiwiaW5qZWN0QXN5bmMiLCJGdW5jdGlvbldpdGhQYXJhbVRva2VucyIsIkZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zLmNvbnN0cnVjdG9yIiwiRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMuZXhlY3V0ZSIsIkZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zLmhhc1Rva2VuIl0sIm1hcHBpbmdzIjoiQUFBQSxxQkFZTyxlQUFlLENBQUMsQ0FBQTtBQUN2QixrQ0FBK0Isd0NBQXdDLENBQUMsQ0FBQTtBQUN4RSx1Q0FBbUMsMENBQTBDLENBQUMsQ0FBQTtBQUU5RSxtQ0FBK0IsNkNBQTZDLENBQUMsQ0FBQTtBQUM3RSwyQkFBbUMseUNBQXlDLENBQUMsQ0FBQTtBQUM3RSxpQ0FNTyxxREFBcUQsQ0FBQyxDQUFBO0FBQzdELDJCQUErQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ2hFLDhCQUEyQix3Q0FBd0MsQ0FBQyxDQUFBO0FBQ3BFLG9CQUFrQiwyQkFBMkIsQ0FBQyxDQUFBO0FBRTlDLDRCQUFrQix1Q0FBdUMsQ0FBQyxDQUFBO0FBRTFELHdDQUFvQywyQ0FBMkMsQ0FBQyxDQUFBO0FBQ2hGLG1DQUErQixzQ0FBc0MsQ0FBQyxDQUFBO0FBQ3RFLHVDQUFtQywwQ0FBMEMsQ0FBQyxDQUFBO0FBQzlFLGtDQUErQix1Q0FBdUMsQ0FBQyxDQUFBO0FBQ3ZFLDZCQUF5QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRTFELHVDQUFtQywwQkFBMEIsQ0FBQyxDQUFBO0FBRTlELDJCQUlPLDhC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LENBQUNBLEdBQUdBLENBQUNBLFVBQUFBLENBQUNBLElBQUlBLE9BQUFBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLEVBQWZBLENBQWVBLENBQUNBLENBQUNBO1FBQ3BEQSxNQUFNQSxDQUFDQSxzQkFBZUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDakRBLENBQUNBO0lBRURGLDBDQUFRQSxHQUFSQSxVQUFTQSxLQUFVQSxJQUFhRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM1RUgsOEJBQUNBO0FBQURBLENBQUNBLEFBWkQsSUFZQztBQVpZLCtCQUF1QiwwQkFZbkMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEFQUF9JRCxcbiAgQVBQTElDQVRJT05fQ09NTU9OX1BST1ZJREVSUyxcbiAgQXBwVmlld01hbmFnZXIsXG4gIERpcmVjdGl2ZVJlc29sdmVyLFxuICBEeW5hbWljQ29tcG9uZW50TG9hZGVyLFxuICBJbmplY3RvcixcbiAgTmdab25lLFxuICBSZW5kZXJlcixcbiAgUHJvdmlkZXIsXG4gIFZpZXdSZXNvbHZlcixcbiAgcHJvdmlkZVxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7QW5pbWF0aW9uQnVpbGRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2FuaW1hdGUvYW5pbWF0aW9uX2J1aWxkZXInO1xuaW1wb3J0IHtNb2NrQW5pbWF0aW9uQnVpbGRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL21vY2svYW5pbWF0aW9uX2J1aWxkZXJfbW9jayc7XG5cbmltcG9ydCB7UHJvdG9WaWV3RmFjdG9yeX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3Byb3RvX3ZpZXdfZmFjdG9yeSc7XG5pbXBvcnQge1JlZmxlY3RvciwgcmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtcbiAgSXRlcmFibGVEaWZmZXJzLFxuICBkZWZhdWx0SXRlcmFibGVEaWZmZXJzLFxuICBLZXlWYWx1ZURpZmZlcnMsXG4gIGRlZmF1bHRLZXlWYWx1ZURpZmZlcnMsXG4gIENoYW5nZURldGVjdG9yR2VuQ29uZmlnXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5pbXBvcnQge0V4Y2VwdGlvbkhhbmRsZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1BpcGVSZXNvbHZlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3BpcGVfcmVzb2x2ZXInO1xuaW1wb3J0IHtYSFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci94aHInO1xuXG5pbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5cbmltcG9ydCB7TW9ja0RpcmVjdGl2ZVJlc29sdmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvbW9jay9kaXJlY3RpdmVfcmVzb2x2ZXJfbW9jayc7XG5pbXBvcnQge01vY2tWaWV3UmVzb2x2ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9tb2NrL3ZpZXdfcmVzb2x2ZXJfbW9jayc7XG5pbXBvcnQge01vY2tMb2NhdGlvblN0cmF0ZWd5fSBmcm9tICdhbmd1bGFyMi9zcmMvbW9jay9tb2NrX2xvY2F0aW9uX3N0cmF0ZWd5JztcbmltcG9ydCB7TG9jYXRpb25TdHJhdGVneX0gZnJvbSAnYW5ndWxhcjIvc3JjL3JvdXRlci9sb2NhdGlvbl9zdHJhdGVneSc7XG5pbXBvcnQge01vY2tOZ1pvbmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9tb2NrL25nX3pvbmVfbW9jayc7XG5cbmltcG9ydCB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9IGZyb20gJy4vdGVzdF9jb21wb25lbnRfYnVpbGRlcic7XG5cbmltcG9ydCB7XG4gIEV2ZW50TWFuYWdlcixcbiAgRVZFTlRfTUFOQUdFUl9QTFVHSU5TLFxuICBFTEVNRU5UX1BST0JFX1BST1ZJREVSU1xufSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9jb21tb25fZG9tJztcblxuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RnVuY3Rpb25XcmFwcGVyLCBUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge0FwcFZpZXdQb29sLCBBUFBfVklFV19QT09MX0NBUEFDSVRZfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19wb29sJztcbmltcG9ydCB7QXBwVmlld01hbmFnZXJVdGlsc30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfbWFuYWdlcl91dGlscyc7XG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX3Rva2Vucyc7XG5pbXBvcnQge0RvbVJlbmRlcmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9yZW5kZXJlcic7XG5pbXBvcnQge0RvbVNoYXJlZFN0eWxlc0hvc3R9IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vc2hhcmVkX3N0eWxlc19ob3N0JztcbmltcG9ydCB7U2hhcmVkU3R5bGVzSG9zdH0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9zaGFyZWRfc3R5bGVzX2hvc3QnO1xuaW1wb3J0IHtEb21FdmVudHNQbHVnaW59IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2RvbV9ldmVudHMnO1xuXG5pbXBvcnQge1NlcmlhbGl6ZXJ9IGZyb20gXCJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3NlcmlhbGl6ZXJcIjtcbmltcG9ydCB7TG9nfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7Q09NUElMRVJfUFJPVklERVJTfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvY29tcGlsZXInO1xuaW1wb3J0IHtEb21SZW5kZXJlcl99IGZyb20gXCJhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9yZW5kZXJlclwiO1xuaW1wb3J0IHtEeW5hbWljQ29tcG9uZW50TG9hZGVyX30gZnJvbSBcImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9keW5hbWljX2NvbXBvbmVudF9sb2FkZXJcIjtcbmltcG9ydCB7QXBwVmlld01hbmFnZXJffSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfbWFuYWdlclwiO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHJvb3QgaW5qZWN0b3IgcHJvdmlkZXJzLlxuICpcbiAqIFRoaXMgbXVzdCBiZSBrZXB0IGluIHN5bmMgd2l0aCB0aGUgX3Jvb3RCaW5kaW5ncyBpbiBhcHBsaWNhdGlvbi5qc1xuICpcbiAqIEByZXR1cm5zIHthbnlbXX1cbiAqL1xuZnVuY3Rpb24gX2dldFJvb3RQcm92aWRlcnMoKSB7XG4gIHJldHVybiBbcHJvdmlkZShSZWZsZWN0b3IsIHt1c2VWYWx1ZTogcmVmbGVjdG9yfSldO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGFwcGxpY2F0aW9uIGluamVjdG9yIHByb3ZpZGVycy5cbiAqXG4gKiBUaGlzIG11c3QgYmUga2VwdCBpbiBzeW5jIHdpdGggX2luamVjdG9yQmluZGluZ3MoKSBpbiBhcHBsaWNhdGlvbi5qc1xuICpcbiAqIEByZXR1cm5zIHthbnlbXX1cbiAqL1xuZnVuY3Rpb24gX2dldEFwcEJpbmRpbmdzKCkge1xuICB2YXIgYXBwRG9jO1xuXG4gIC8vIFRoZSBkb2N1bWVudCBpcyBvbmx5IGF2YWlsYWJsZSBpbiBicm93c2VyIGVudmlyb25tZW50XG4gIHRyeSB7XG4gICAgYXBwRG9jID0gRE9NLmRlZmF1bHREb2MoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGFwcERvYyA9IG51bGw7XG4gIH1cblxuICByZXR1cm4gW1xuICAgIEFQUExJQ0FUSU9OX0NPTU1PTl9QUk9WSURFUlMsXG4gICAgcHJvdmlkZShDaGFuZ2VEZXRlY3RvckdlbkNvbmZpZywge3VzZVZhbHVlOiBuZXcgQ2hhbmdlRGV0ZWN0b3JHZW5Db25maWcodHJ1ZSwgZmFsc2UsIHRydWUpfSksXG4gICAgcHJvdmlkZShET0NVTUVOVCwge3VzZVZhbHVlOiBhcHBEb2N9KSxcbiAgICBwcm92aWRlKERvbVJlbmRlcmVyLCB7dXNlQ2xhc3M6IERvbVJlbmRlcmVyX30pLFxuICAgIHByb3ZpZGUoUmVuZGVyZXIsIHt1c2VFeGlzdGluZzogRG9tUmVuZGVyZXJ9KSxcbiAgICBwcm92aWRlKEFQUF9JRCwge3VzZVZhbHVlOiAnYSd9KSxcbiAgICBEb21TaGFyZWRTdHlsZXNIb3N0LFxuICAgIHByb3ZpZGUoU2hhcmVkU3R5bGVzSG9zdCwge3VzZUV4aXN0aW5nOiBEb21TaGFyZWRTdHlsZXNIb3N0fSksXG4gICAgQXBwVmlld1Bvb2wsXG4gICAgcHJvdmlkZShBcHBWaWV3TWFuYWdlciwge3VzZUNsYXNzOiBBcHBWaWV3TWFuYWdlcl99KSxcbiAgICBBcHBWaWV3TWFuYWdlclV0aWxzLFxuICAgIFNlcmlhbGl6ZXIsXG4gICAgRUxFTUVOVF9QUk9CRV9QUk9WSURFUlMsXG4gICAgcHJvdmlkZShBUFBfVklFV19QT09MX0NBUEFDSVRZLCB7dXNlVmFsdWU6IDUwMH0pLFxuICAgIFByb3RvVmlld0ZhY3RvcnksXG4gICAgcHJvdmlkZShEaXJlY3RpdmVSZXNvbHZlciwge3VzZUNsYXNzOiBNb2NrRGlyZWN0aXZlUmVzb2x2ZXJ9KSxcbiAgICBwcm92aWRlKFZpZXdSZXNvbHZlciwge3VzZUNsYXNzOiBNb2NrVmlld1Jlc29sdmVyfSksXG4gICAgcHJvdmlkZShJdGVyYWJsZURpZmZlcnMsIHt1c2VWYWx1ZTogZGVmYXVsdEl0ZXJhYmxlRGlmZmVyc30pLFxuICAgIHByb3ZpZGUoS2V5VmFsdWVEaWZmZXJzLCB7dXNlVmFsdWU6IGRlZmF1bHRLZXlWYWx1ZURpZmZlcnN9KSxcbiAgICBMb2csXG4gICAgcHJvdmlkZShEeW5hbWljQ29tcG9uZW50TG9hZGVyLCB7dXNlQ2xhc3M6IER5bmFtaWNDb21wb25lbnRMb2FkZXJffSksXG4gICAgUGlwZVJlc29sdmVyLFxuICAgIHByb3ZpZGUoRXhjZXB0aW9uSGFuZGxlciwge3VzZVZhbHVlOiBuZXcgRXhjZXB0aW9uSGFuZGxlcihET00pfSksXG4gICAgcHJvdmlkZShMb2NhdGlvblN0cmF0ZWd5LCB7dXNlQ2xhc3M6IE1vY2tMb2NhdGlvblN0cmF0ZWd5fSksXG4gICAgcHJvdmlkZShYSFIsIHt1c2VDbGFzczogRE9NLmdldFhIUigpfSksXG4gICAgVGVzdENvbXBvbmVudEJ1aWxkZXIsXG4gICAgcHJvdmlkZShOZ1pvbmUsIHt1c2VDbGFzczogTW9ja05nWm9uZX0pLFxuICAgIHByb3ZpZGUoQW5pbWF0aW9uQnVpbGRlciwge3VzZUNsYXNzOiBNb2NrQW5pbWF0aW9uQnVpbGRlcn0pLFxuICAgIEV2ZW50TWFuYWdlcixcbiAgICBuZXcgUHJvdmlkZXIoRVZFTlRfTUFOQUdFUl9QTFVHSU5TLCB7dXNlQ2xhc3M6IERvbUV2ZW50c1BsdWdpbiwgbXVsdGk6IHRydWV9KVxuICBdO1xufVxuXG5mdW5jdGlvbiBfcnVudGltZUNvbXBpbGVyQmluZGluZ3MoKSB7XG4gIHJldHVybiBbXG4gICAgcHJvdmlkZShYSFIsIHt1c2VDbGFzczogRE9NLmdldFhIUigpfSksXG4gICAgQ09NUElMRVJfUFJPVklERVJTLFxuICBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVGVzdEluamVjdG9yKHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogSW5qZWN0b3Ige1xuICB2YXIgcm9vdEluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShfZ2V0Um9vdFByb3ZpZGVycygpKTtcbiAgcmV0dXJuIHJvb3RJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlQ2hpbGQoTGlzdFdyYXBwZXIuY29uY2F0KF9nZXRBcHBCaW5kaW5ncygpLCBwcm92aWRlcnMpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRlc3RJbmplY3RvcldpdGhSdW50aW1lQ29tcGlsZXIoXG4gICAgcHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBJbmplY3RvciB7XG4gIHJldHVybiBjcmVhdGVUZXN0SW5qZWN0b3IoTGlzdFdyYXBwZXIuY29uY2F0KF9ydW50aW1lQ29tcGlsZXJCaW5kaW5ncygpLCBwcm92aWRlcnMpKTtcbn1cblxuLyoqXG4gKiBBbGxvd3MgaW5qZWN0aW5nIGRlcGVuZGVuY2llcyBpbiBgYmVmb3JlRWFjaCgpYCBhbmQgYGl0KClgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiBiZWZvcmVFYWNoKGluamVjdChbRGVwZW5kZW5jeSwgQUNsYXNzXSwgKGRlcCwgb2JqZWN0KSA9PiB7XG4gKiAgIC8vIHNvbWUgY29kZSB0aGF0IHVzZXMgYGRlcGAgYW5kIGBvYmplY3RgXG4gKiAgIC8vIC4uLlxuICogfSkpO1xuICpcbiAqIGl0KCcuLi4nLCBpbmplY3QoW0FDbGFzc10sIChvYmplY3QpID0+IHtcbiAqICAgb2JqZWN0LmRvU29tZXRoaW5nKCk7XG4gKiAgIGV4cGVjdCguLi4pO1xuICogfSlcbiAqIGBgYFxuICpcbiAqIE5vdGVzOlxuICogLSBpbmplY3QgaXMgY3VycmVudGx5IGEgZnVuY3Rpb24gYmVjYXVzZSBvZiBzb21lIFRyYWNldXIgbGltaXRhdGlvbiB0aGUgc3ludGF4IHNob3VsZCBldmVudHVhbGx5XG4gKiAgIGJlY29tZXMgYGl0KCcuLi4nLCBASW5qZWN0IChvYmplY3Q6IEFDbGFzcywgYXN5bmM6IEFzeW5jVGVzdENvbXBsZXRlcikgPT4geyAuLi4gfSk7YFxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHRva2Vuc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0Z1bmN0aW9uV2l0aFBhcmFtVG9rZW5zfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0KHRva2VuczogYW55W10sIGZuOiBGdW5jdGlvbik6IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHtcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbldpdGhQYXJhbVRva2Vucyh0b2tlbnMsIGZuLCBmYWxzZSk7XG59XG5cbi8qKlxuICogQWxsb3dzIGluamVjdGluZyBkZXBlbmRlbmNpZXMgaW4gYGJlZm9yZUVhY2goKWAgYW5kIGBpdCgpYC4gVGhlIHRlc3QgbXVzdCByZXR1cm5cbiAqIGEgcHJvbWlzZSB3aGljaCB3aWxsIHJlc29sdmUgd2hlbiBhbGwgYXN5bmNocm9ub3VzIGFjdGl2aXR5IGlzIGNvbXBsZXRlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiBpdCgnLi4uJywgaW5qZWN0QXN5bmMoW0FDbGFzc10sIChvYmplY3QpID0+IHtcbiAqICAgcmV0dXJuIG9iamVjdC5kb1NvbWV0aGluZygpLnRoZW4oKCkgPT4ge1xuICogICAgIGV4cGVjdCguLi4pO1xuICogICB9KTtcbiAqIH0pXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSB0b2tlbnNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbldpdGhQYXJhbVRva2Vuc31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluamVjdEFzeW5jKHRva2VuczogYW55W10sIGZuOiBGdW5jdGlvbik6IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHtcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbldpdGhQYXJhbVRva2Vucyh0b2tlbnMsIGZuLCB0cnVlKTtcbn1cblxuZXhwb3J0IGNsYXNzIEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdG9rZW5zOiBhbnlbXSwgcHJpdmF0ZSBfZm46IEZ1bmN0aW9uLCBwdWJsaWMgaXNBc3luYzogYm9vbGVhbikge31cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIGV4ZWN1dGVkIGZ1bmN0aW9uLlxuICAgKi9cbiAgZXhlY3V0ZShpbmplY3RvcjogSW5qZWN0b3IpOiBhbnkge1xuICAgIHZhciBwYXJhbXMgPSB0aGlzLl90b2tlbnMubWFwKHQgPT4gaW5qZWN0b3IuZ2V0KHQpKTtcbiAgICByZXR1cm4gRnVuY3Rpb25XcmFwcGVyLmFwcGx5KHRoaXMuX2ZuLCBwYXJhbXMpO1xuICB9XG5cbiAgaGFzVG9rZW4odG9rZW46IGFueSk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fdG9rZW5zLmluZGV4T2YodG9rZW4pID4gLTE7IH1cbn1cbiJdfQ==