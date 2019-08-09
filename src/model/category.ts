import { autoserialize } from 'cerialize';

export class CategoryModel {

    @autoserialize
    id: string;

    @autoserialize
    name: string;

    @autoserialize
    multiplicator: number;

    @autoserialize
    cubecompsId: number;

    @autoserialize
    rounds: number;

    @autoserialize
    importedRounds: number;
}