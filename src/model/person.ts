import { autoserialize } from "cerialize";

export class PersonModel {

    @autoserialize
    public id: number;

    @autoserialize
    public name: string;

    @autoserialize
    public price: number;

    @autoserialize
    public points: number;

}
