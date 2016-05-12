import {HTTP_PROVIDERS, Http} from 'angular2/http';
import {Injectable} from "angular2/core";
import {Termination} from "./termination";

@Injectable()
export class TerminationService {
    private _terminations: Array<Termination> = [];

    constructor(http:Http) {
        http.get('assets/terminations.json').subscribe(res => {
            this._terminations = (<Array<any>> res.json()).map(data => Termination.fromJson(data));
        });
    }

    public get terminations() : Array<Termination> {
        return this._terminations;
    }
}