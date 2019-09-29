import { autoserialize } from "cerialize";


export class ResultModel {

    @autoserialize
    public cuber: number

    @autoserialize
    public eventId: string;

    @autoserialize
    public points: number;

    @autoserialize
    public rank: number;

    @autoserialize
    public best: number;

    @autoserialize
    public average: number;
}