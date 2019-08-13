import { autoserialize } from 'cerialize';

export class ResultsModel {

    @autoserialize
    position: number;

    @autoserialize
    points: number;

    @autoserialize
    person: string;

    @autoserialize
    category: string;


}