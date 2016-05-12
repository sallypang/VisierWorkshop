export class Termination {
    constructor (
        public employeeID: number,
        public terminationDate: Date){}

    public static fromJson(data : any) : Termination {
        return new Termination(
            data.employeeID,
            new Date(<number> data.terminationDate))
    }
}
