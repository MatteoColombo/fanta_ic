import { IRepo } from "./i-repo";
import { EventModel } from "../../model/event";

export interface IEvent extends IRepo {

    eventExists(id: string): Promise<boolean>;
    getEvent(id: string): Promise<EventModel>;
    getEvents(): Promise<EventModel[]>;

    getEventRounds(id: string): Promise<number>;
    getEventRemainingRounds(id: string): Promise<number>;
    setEventRemainingRounds(id: string, rounds: number): Promise<EventModel>;

    getImportableRounds(): Promise<EventModel[]>;

}