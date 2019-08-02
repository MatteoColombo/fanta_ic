import { autoserialize } from "cerialize";
import { PersonModel } from './person'

export class TeamModel {

    @autoserialize
    public id: number;
    
    @autoserialize
    public name: string;

    @autoserialize
    public points: number;

    @autoserialize
    public cubers: PersonModel[];
}