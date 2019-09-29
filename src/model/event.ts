import { autoserialize } from "cerialize";

export class EventModel {

    @autoserialize
    public eventId: string;

    @autoserialize
    public name: string;

    @autoserialize
    public multiplicator: number;

    @autoserialize
    public rounds: number;

    @autoserialize
    public importedRounds: number;

    @autoserialize
    public sortByAverage: boolean;
}