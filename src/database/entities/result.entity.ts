import { Column, Entity, JoinTable, ManyToOne } from "typeorm";
import { ResultModel } from "../../model/result";
import { ITransformable } from "../interfaces/i-transformable";
import { CuberEntity } from "./cuber.entity";
import { EventEntity } from "./event.entity";

@Entity()
export class ResultEntity implements ITransformable<ResultModel> {

    @ManyToOne((type) => CuberEntity, (cuber) => cuber.results, { primary: true })
    @JoinTable()
    public cuber: CuberEntity;

    @ManyToOne((type) => EventEntity, (event) => event.results, { primary: true })
    @JoinTable()
    public event: EventEntity;

    @Column({ nullable: false, default: 0 })
    public points: number;

    @Column({ nullable: false, default: 0 })
    public rank: number;

    @Column({ nullable: false, default: 0 })
    public best: number;

    @Column({ nullable: false, default: 0 })
    public average: number;

    @Column({ nullable: false, default: 0 })
    public singleRecord: number;

    @Column({ nullable: false, default: 0 })
    public averageRecord: number;


    public _transform(): ResultModel {
        const model: ResultModel = new ResultModel();
        model.cuber = this.cuber.id;
        model.eventId = this.event.eventId;
        model.points = this.points;
        model.rank = this.rank;
        model.best = this.best;
        model.average = this.average;
        model.averageRecord = this.averageRecord;
        model.singleRecord = this.singleRecord;
        return model;
    }

    public _assimilate(origin: ResultModel): void {
        this.cuber = new CuberEntity();
        this.cuber.id = origin.cuber;
        this.event = new EventEntity();
        this.event.eventId = origin.eventId;
        this.points = origin.points;
        this.rank = origin.rank;
        this.best = origin.best;
        this.average = origin.average;
        this.averageRecord = origin.averageRecord;
        this.singleRecord = origin.singleRecord;
    }

}
