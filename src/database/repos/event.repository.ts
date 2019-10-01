import { EntityRepository, AbstractRepository, Any, Not } from "typeorm";
import { EventEntity } from "../entities/event.entity";
import { IEvent } from "../interfaces/i-event";
import { events as importEvents } from "../init_files/events";
import { EventModel } from "../../model/event";


@EntityRepository(EventEntity)
export class EventRepository extends AbstractRepository<EventEntity> implements IEvent {

    public async eventExists(id: string): Promise<boolean> {
        let count: number = await this.repository.count({ eventId: id });
        return count > 0;
    }

    public async getEvent(id: string): Promise<EventModel> {
        let event: EventEntity = await this.repository.findOne(id);
        return this.entityToEvent(event);
    }

    public async getEvents(): Promise<EventModel[]> {
        let events: EventEntity[] = await this.repository.find();
        return events.map(e => this.entityToEvent(e));
    }

    public async getEventRounds(id: string): Promise<number> {
        let event: EventEntity = await this.repository.findOne(id);
        return event ? event.rounds : 0;
    }

    public async getEventRemainingRounds(id: string): Promise<number> {
        let event: EventEntity = await this.repository.findOne(id);
        return event ? (event.rounds - event.importedRounds) : 0;
    }

    public async setEventRemainingRounds(id: string, rounds: number): Promise<EventModel> {
        let event: EventEntity = await this.repository.findOne(id);
        event.importedRounds = rounds;
        event = await this.repository.save(event);
        return this.entityToEvent(event);
    }

    public async getImportableRounds(): Promise<EventModel[]> {
        let events: EventEntity[] = await this.repository.createQueryBuilder()
            .select("event").from(EventEntity, "event")
            .where("event.rounds > event.importedRounds")
            .orderBy("event.eventId", "ASC").getMany();
        return events.map(e => this.entityToEvent(e));
    }

    public async initDefaults(): Promise<void> {
        for (let e of importEvents) {
            let exists: boolean = await this.eventExists(e.id);
            if (!exists) {
                let newEvent: EventEntity = new EventEntity();
                newEvent.eventId = e.id;
                newEvent.name = e.name;
                newEvent.sortByAverage = e.sortByAverage;
                newEvent.rounds = e.rounds;
                newEvent.multiplicator = e.multiplicator;
                await this.repository.save(newEvent);
            }
        }
    }

    private async deleteEvents(): Promise<void> {
        this.repository.delete({ eventId: Not("0") })
    }

    private entityToEvent(event: EventEntity): EventModel {
        if (event)
            return event._transform();
        else return null;
    }


}