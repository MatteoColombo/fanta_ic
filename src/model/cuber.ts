import { autoserialize } from "cerialize";


export class CuberModel {

    @autoserialize
    public id: number;

    @autoserialize
    public name: string;

    @autoserialize
    public wcaId: string;

    @autoserialize
    public points: number;

    @autoserialize
    public price: number;

    @autoserialize
    public rank3: number;

    @autoserialize
    public photoUrl: string;

}