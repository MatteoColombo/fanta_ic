import { autoserialize } from "cerialize";

export class CategoryModel {

    @autoserialize
    public id: string;

    @autoserialize
    public name: string;

    @autoserialize
    public multiplicator: number;

    @autoserialize
    public cubecompsId: number;

    @autoserialize
    public rounds: number;

    @autoserialize
    public importedRounds: number;

    @autoserialize
    public sortByAverage: boolean;

    @autoserialize
    public priceComputed: boolean;
}
