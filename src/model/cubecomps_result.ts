import { autoserialize } from "cerialize";
import { ResultsModel } from "./results";

export class CubecompsResults {

    @autoserialize
    competitor_id: number;

    @autoserialize
    name: string;

    @autoserialize
    position: number;

    @autoserialize
    country: string;

    @autoserialize
    average: string;

    @autoserialize
    best: string;

    @autoserialize
    points: number;

    public toResult(): ResultsModel {
        let result: ResultsModel = new ResultsModel();
        result.category;
        result.points = this.points;
        result.person = this.name;
        result.position= this.position

        return result;
    }
}