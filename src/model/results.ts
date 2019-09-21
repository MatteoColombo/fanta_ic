import { autoserialize } from "cerialize";

export class ResultsModel {

    @autoserialize
    public position: number;

    @autoserialize
    public points: number;

    @autoserialize
    public person: string;

    @autoserialize
    public category: string;

}
