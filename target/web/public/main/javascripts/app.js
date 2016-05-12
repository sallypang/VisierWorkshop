System.register(['angular2/core', 'angular2/platform/browser', 'angular2/http', "./model/employeeService", "./model/terminationService", "./view/employeesComponent", "./view/terminationsComponent"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, browser_1, http_1, employeeService_1, terminationService_1, employeesComponent_1, terminationsComponent_1;
    var App;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (browser_1_1) {
                browser_1 = browser_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (employeeService_1_1) {
                employeeService_1 = employeeService_1_1;
            },
            function (terminationService_1_1) {
                terminationService_1 = terminationService_1_1;
            },
            function (employeesComponent_1_1) {
                employeesComponent_1 = employeesComponent_1_1;
            },
            function (terminationsComponent_1_1) {
                terminationsComponent_1 = terminationsComponent_1_1;
            }],
        execute: function() {
            App = (function () {
                function App() {
                }
                App = __decorate([
                    core_1.Component({
                        selector: 'my-app',
                        template: "\n    <div>\n      <employees></employees>\n      <terminations></terminations>\n    </div>\n  ",
                        directives: [employeesComponent_1.EmployeesComponent, terminationsComponent_1.TerminationsComponent]
                    }), 
                    __metadata('design:paramtypes', [])
                ], App);
                return App;
            })();
            exports_1("App", App);
            browser_1.bootstrap(App, [http_1.HTTP_PROVIDERS, employeeService_1.EmployeeService, terminationService_1.TerminationService]);
        }
    }
});
//# sourceMappingURL=app.js.map