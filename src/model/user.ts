import { autoserialize } from "cerialize";


export class UserModel {

    @autoserialize
    public id: number;

    @autoserialize
    public name: string;

}