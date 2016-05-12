System.register(['angular2/http', "angular2/core", "./termination"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var http_1, core_1, termination_1;
    var TerminationService;
    return {
        setters:[
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (termination_1_1) {
                termination_1 = termination_1_1;
            }],
        execute: function() {
            TerminationService = (function () {
                function TerminationService(http) {
                    var _this = this;
                    this._terminations = [];
                    http.get('assets/terminations.json').subscribe(function (res) {
                        _this._terminations = res.json().map(function (data) { return termination_1.Termination.fromJson(data); });
                    });
                }
                Object.defineProperty(TerminationService.prototype, "terminations", {
                    get: function () {
                        return this._terminations;
                    },
                    enumerable: true,
                    configurable: true
                });
                TerminationService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [http_1.Http])
                ], TerminationService);
                return TerminationService;
            })();
            exports_1("TerminationService", TerminationService);
        }
    }
});
//# sourceMappingURL=terminationService.js.map