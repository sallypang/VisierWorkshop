System.register(['angular2/http', "angular2/core", "./employee"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var http_1, core_1, employee_1;
    var EmployeeService;
    return {
        setters:[
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (employee_1_1) {
                employee_1 = employee_1_1;
            }],
        execute: function() {
            EmployeeService = (function () {
                function EmployeeService(http) {
                    var _this = this;
                    this._employees = [];
                    http.get('assets/employee.json').subscribe(function (res) {
                        _this._employees = res.json().map(function (data) { return employee_1.Employee.fromJson(data); });
                    });
                }
                EmployeeService.prototype.findEmployeeById = function (id) {
                    return this._employees.find(function (employee) { return employee.employeeID === id; });
                };
                Object.defineProperty(EmployeeService.prototype, "employees", {
                    get: function () {
                        return this._employees;
                    },
                    enumerable: true,
                    configurable: true
                });
                EmployeeService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [http_1.Http])
                ], EmployeeService);
                return EmployeeService;
            })();
            exports_1("EmployeeService", EmployeeService);
        }
    }
});
//# sourceMappingURL=employeeService.js.map