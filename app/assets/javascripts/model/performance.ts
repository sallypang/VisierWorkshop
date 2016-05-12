export class Performance {
	constructor (
		public employeeID: number,
		public performance: number,
		public validity: number
	

	public static fromJson(data: any): Performance {
		return new Performance(
			data.employeeID,
			data.performance,
			data.validity
		)
	}
}