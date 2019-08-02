import { autoserialize } from "cerialize";

export class PersonModel {

    @autoserialize
    id: number;

    @autoserialize
    name: string;

    @autoserialize
    price: number;


}