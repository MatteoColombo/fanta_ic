import { autoserialize } from "cerialize";
import { ResultsModel } from "./results";

/**
 * An auxiliary class used to parse results received from Cubecomps.
 */
export class CubecompsResults {

    @autoserialize
    public competitor_id: number;

    @autoserialize
    public name: string;

    @autoserialize
    public position: number;

    @autoserialize
    public country: string;

    @autoserialize
    public average: string;

    @autoserialize
    public best: string;

    @autoserialize
    public points: number;

    public toResult(): ResultsModel {
        const result: ResultsModel = new ResultsModel();
        result.category;
        result.points = this.points;
        result.person = this.name;
        result.position = this.position;

        return result;
    }
}
