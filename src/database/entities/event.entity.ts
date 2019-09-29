import { ITransformable } from "../interfaces/i-transformable";
import { Column, OneToMany, PrimaryColumn, Entity } from "typeorm";
import { EventModel } from "../../model/event";
import { ResultEntity } from "./result.entity";

@Entity()
export class EventEntity implements ITransformable<EventModel>{

    @PrimaryColumn()
    public eventId: string;

    @Column({ nullable: false })
    public name: string;

    @Column({ nullable: false, default: 1, type: "double" })
    public multiplicator: number;

    @Column({ nullable: false, default: 1 })
    public rounds: number;

    @Column({ nullable: false, default: 0 })
    public importedRounds: number;

    @Column({ nullable: false, default: true })
    public sortByAverage: boolean;

    @OneToMany(type => ResultEntity, result => result.event)
    public results: ResultEntity[];


    _transform(): EventModel {
        let model: EventModel = new EventModel();
        model.eventId = this.eventId;
        model.name = this.name;
        model.multiplicator = this.multiplicator;
        model.rounds = this.rounds;
        model.importedRounds = this.importedRounds;
        model.sortByAverage = this.sortByAverage;
        return model;
    }

    _assimilate(origin: EventModel): void {
        this.eventId = origin.eventId;
        this.name = origin.name;
        this.multiplicator = origin.multiplicator;
        this.rounds = origin.rounds;
        this.importedRounds = origin.importedRounds;
        this.sortByAverage = origin.sortByAverage;
    }


}