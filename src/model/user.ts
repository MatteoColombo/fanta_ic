import { autoserialize, autoserializeAs } from "cerialize";
import { TeamModel } from "./team";


export class UserModel {

    @autoserialize
    public id: number;

    @autoserialize
    public name: string;

    @autoserialize
    public isOrganizer: boolean;

    @autoserializeAs(TeamModel)
    public team: TeamModel;
}