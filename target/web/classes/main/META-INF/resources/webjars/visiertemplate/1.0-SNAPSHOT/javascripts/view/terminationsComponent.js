System.register(['angular2/core', 'angular2/common', "../model/employeeService", "../model/terminationService"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, common_1, employeeService_1, terminationService_1;
    var TerminationsComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (common_1_1) {
                common_1 = common_1_1;
            },
            function (employeeService_1_1) {
                employeeService_1 = employeeService_1_1;
            },
            function (terminationService_1_1) {
                terminationService_1 = terminationService_1_1;
            }],
        execute: function() {
            TerminationsComponent = (function () {
                function TerminationsComponent(_employeeService, _terminationService) {
                    this._employeeService = _employeeService;
                    this._terminationService = _terminationService;
                }
                Object.defineProperty(TerminationsComponent.prototype, "terminations", {
                    get: function () {
                        return this._terminationService.terminations;
                    },
                    enumerable: true,
                    configurable: true
                });
                TerminationsComponent.prototype.onSelect = function (record) {
                    this.employeeName = this._employeeService.findEmployeeById(record.employeeID).name;
                    this.selectedDate = record.terminationDate;
                    this.termMessage = this.employeeName + " was terminated on " + this.selectedDate;
                };
                TerminationsComponent = __decorate([
                    core_1.Component({
                        selector: 'terminations',
                        templateUrl: "assets/templates/terminations.ng.html",
                        directives: [common_1.CORE_DIRECTIVES]
                    }), 
                    __metadata('design:paramtypes', [employeeService_1.EmployeeService, terminationService_1.TerminationService])
                ], TerminationsComponent);
                return TerminationsComponent;
            })();
            exports_1("TerminationsComponent", TerminationsComponent);
        }
    }
});
//# sourceMappingURL=terminationsComponent.js.map