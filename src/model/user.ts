import { autoserialize, autoserializeAs } from "cerialize";

export class UserModel {

    @autoserialize
    public id: number;

    @autoserialize
    public name: string;

    @autoserialize
    public wcaId: string;

    @autoserialize
    public isOrganizer: boolean;

}
