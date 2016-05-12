import {Component} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {HTTP_PROVIDERS} from 'angular2/http';
import {EmployeeService} from "./model/employeeService";
import {TerminationService} from "./model/terminationService";
import {EmployeesComponent} from "./view/employeesComponent";
import {TerminationsComponent} from "./view/terminationsComponent";

@Component({
  selector: 'my-app',
  template: `
    <div>
      <employees></employees>
      <terminations></terminations>
    </div>
  `,
  directives: [EmployeesComponent, TerminationsComponent]
})
export class App {
}

bootstrap(App, [HTTP_PROVIDERS, EmployeeService, TerminationService]);
