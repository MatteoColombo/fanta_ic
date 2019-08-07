import { autoserialize } from 'cerialize';

export class CategoryModel {

    @autoserialize
    id: string;

    @autoserialize
    name: string;

    @autoserialize
    multiplicator: number;
}