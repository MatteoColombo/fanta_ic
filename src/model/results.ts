import { autoserialize } from 'cerialize';

export class ResultsModel {
    
    @autoserialize
    pos: number;

    @autoserialize
    points: number;
}