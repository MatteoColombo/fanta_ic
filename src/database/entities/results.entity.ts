import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { ResultsModel } from "../../model/results";
import { Transformable } from "../transformable.interface";
import { CategoryEntity } from "./category.entity";
import { PersonEntity } from "./person.entity";

@Entity()
export class ResultsEntity extends BaseEntity implements Transformable<ResultsModel> {

    @Column()
    public position: number;

    @Column()
    public points: number;

    @ManyToOne((type) => PersonEntity, (person) => person.results, { primary: true, eager: true })
    public person: PersonEntity;

    @ManyToOne((type) => CategoryEntity, (category) => category.results, { primary: true, eager: true })
    public category: CategoryEntity;

    public _transform(): ResultsModel {
        const model = new ResultsModel();
        model.position = this.position;
        model.points = this.points;
        model.category = this.category.id;
        model.person = this.person.name;
        return model;
    }

    public _assimilate(origin: ResultsModel) {
        this.points = origin.points;
        this.position = origin.position;
    }

}
