import {HTTP_PROVIDERS, Http} from 'angular2/http';
import {Injectable} from "angular2/core";
import {Employee} from "./employee";

@Injectable()
export class EmployeeService {
    private _employees: Array<Employee> = [];

    constructor(http:Http) {
        http.get('assets/employee.json').subscribe(res => {
            this._employees = (<Array<any>> res.json()).map(data => Employee.fromJson(data));
        });
    }

    public findEmployeeById(id: number): Employee {
        return this._employees.find(employee => employee.employeeID === id);
    }

    public get employees() : Array<Employee> {
        return this._employees;
    }
}