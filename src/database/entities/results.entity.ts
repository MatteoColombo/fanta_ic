import { Entity, Column, PrimaryColumn, BaseEntity, ManyToOne } from 'typeorm';
import { Transformable } from '../transformable.interface';
import { ResultsModel } from '../../model/results'
import { PersonEntity } from './person.entity';
import { CategoryEntity } from './category.entity'

@Entity()
export class ResultsEntity extends BaseEntity implements Transformable<ResultsModel> {

    @Column()
    pos: number;

    @Column()
    points: number;

    @ManyToOne(type => PersonEntity, person => person.results, { primary: true })
    person: PersonEntity;

    @ManyToOne(type => CategoryEntity, category => category.results, { primary: true })
    category: CategoryEntity;

    _transform(): ResultsModel {
        let model = new ResultsModel();
        model.pos = this.pos;
        model.points = this.points;
        return model;
    }

    _assimilate(origin: ResultsModel) {
        this.points = origin.points;
        this.pos = origin.pos;
    }

}