System.register([], function(exports_1) {
    var Termination;
    return {
        setters:[],
        execute: function() {
            Termination = (function () {
                function Termination(employeeID, terminationDate) {
                    this.employeeID = employeeID;
                    this.terminationDate = terminationDate;
                }
                Termination.fromJson = function (data) {
                    return new Termination(data.employeeID, new Date(data.terminationDate));
                };
                return Termination;
            })();
            exports_1("Termination", Termination);
        }
    }
});
//# sourceMappingURL=termination.js.map