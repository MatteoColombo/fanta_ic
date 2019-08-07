import { autoserialize, autoserializeAs } from "cerialize";
import { PersonModel } from './person'

export class TeamModel {

    @autoserialize
    public id: number;

    @autoserialize
    public name: string;

    @autoserialize
    public points: number;

    @autoserializeAs(PersonModel)
    public cubers: PersonModel[];

}