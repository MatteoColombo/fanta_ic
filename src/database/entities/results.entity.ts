import { Entity, Column, PrimaryColumn, BaseEntity, ManyToOne } from 'typeorm';
import { Transformable } from '../transformable.interface';
import { ResultsModel } from '../../model/results'
import { PersonEntity } from './person.entity';
import { CategoryEntity } from './category.entity'

@Entity()
export class ResultsEntity extends BaseEntity implements Transformable<ResultsModel> {

    @Column()
    position: number;

    @Column()
    points: number;

    @ManyToOne(type => PersonEntity, person => person.results, { primary: true, eager: true })
    person: PersonEntity;

    @ManyToOne(type => CategoryEntity, category => category.results, { primary: true, eager: true })
    category: CategoryEntity;

    _transform(): ResultsModel {
        let model = new ResultsModel();
        model.position = this.position;
        model.points = this.points;
        model.category = this.category.id;
        model.person = this.person.name;
        return model;
    }

    _assimilate(origin: ResultsModel) {
        this.points = origin.points;
        this.position = origin.position;
    }

}