import { autoserialize } from "cerialize";
import { TeamModel } from "./team";


export class UserModel {

    @autoserialize
    public id: number;

    @autoserialize
    public name: string;
    
    @autoserialize
    public email: string;

    @autoserialize
    public isOrganizer: boolean;

    @autoserialize
    public team: TeamModel;
}