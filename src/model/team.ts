import { autoserialize, autoserializeAs } from "cerialize";
import { PersonModel } from "./person";

export class TeamModel {

    @autoserialize
    public id: number;

    @autoserialize
    public name: string;

    @autoserialize
    public points: number;

    @autoserialize
    public position: number;

    @autoserialize
    public ownerId: number;

    @autoserialize
    public ownerName: string;

    @autoserializeAs(PersonModel)
    public cubers: PersonModel[];

}
