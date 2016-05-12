import {HTTP_PROVIDERS, Http} from 'angular2/http';
import {Injectable} from "angular2/core";
import {Employee} from "./performance";

@Injectable()
export class PerformanceService {
	private _performances: Array<Performance> = [];

	constructor(http:Http) {
		http.get('assets/performance.json').subscribe(res => {
            this._performances = (<Array<any>> res.json()).map(data => Performance.fromJson(data));
        });
	}


}