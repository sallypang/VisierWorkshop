import {Component} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {EmployeeService} from "../model/employeeService";

@Component({
    selector: 'employees',
    templateUrl: `assets/templates/employees.ng.html`,
    directives: [CORE_DIRECTIVES]
})
export class EmployeesComponent {
    constructor(private _employeeService : EmployeeService) {
    }

    public get employees() {
        return this._employeeService.employees;
    }
}
