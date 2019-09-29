import { autoserialize, autoserializeAs } from "cerialize";
import { CuberModel } from "./cuber";
import { UserModel } from "./user";


export class TeamModel {

    @autoserialize
    public id: number;

    @autoserialize
    public name: string;

    @autoserialize
    public points: number;

    @autoserialize
    public rank: number;

    @autoserializeAs(CuberModel)
    public cubers: CuberModel[];

    @autoserializeAs(UserModel)
    public owner: UserModel;
}