export class Employee {
    constructor (
        public employeeID: number,
        public name: string,
        public gender : string,
        public age : number,
        public location : string,
        public fteFactor : number,
        public orgID : string){}


    public static fromJson(data : any) : Employee {
        return new Employee(
            data.employeeID,
            data.name,
            data.gender,
            data.age,
            data.location,
            data.fteFactor,
            data.orgID
        )
    }
}
