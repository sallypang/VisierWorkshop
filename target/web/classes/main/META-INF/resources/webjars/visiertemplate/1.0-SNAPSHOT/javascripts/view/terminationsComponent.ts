import {Component} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {EmployeeService} from "../model/employeeService";
import {TerminationService} from "../model/terminationService";
import {Termination} from "../model/termination";

@Component({
    selector: 'terminations',
    templateUrl: `assets/templates/terminations.ng.html`,
    directives: [CORE_DIRECTIVES]
})
export class TerminationsComponent {
    public employeeName: string;
    public selectedDate: Date;

    public termMessage: string;

    constructor(private _employeeService : EmployeeService, private _terminationService : TerminationService) {
    }

    public get terminations() {
        return this._terminationService.terminations;
    }

    onSelect(record: Termination) {
        this.employeeName = this._employeeService.findEmployeeById(record.employeeID).name;
        this.selectedDate = record.terminationDate;

        this.termMessage = this.employeeName + " was terminated on " + this.selectedDate;
    }
}
