System.register([], function(exports_1) {
    var Employee;
    return {
        setters:[],
        execute: function() {
            Employee = (function () {
                function Employee(employeeID, name, gender, age, location, fteFactor, orgID) {
                    this.employeeID = employeeID;
                    this.name = name;
                    this.gender = gender;
                    this.age = age;
                    this.location = location;
                    this.fteFactor = fteFactor;
                    this.orgID = orgID;
                }
                Employee.fromJson = function (data) {
                    return new Employee(data.employeeID, data.name, data.gender, data.age, data.location, data.fteFactor, data.orgID);
                };
                return Employee;
            })();
            exports_1("Employee", Employee);
        }
    }
});
//# sourceMappingURL=employee.js.map