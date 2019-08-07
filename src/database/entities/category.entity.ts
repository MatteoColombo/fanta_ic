import { Entity, Column, PrimaryColumn, BaseEntity, JoinTable, OneToMany } from 'typeorm';
import { Transformable } from '../transformable.interface';
import { CategoryModel } from '../../model/category';
import { ResultsEntity } from './results.entity'

@Entity()
export class CategoryEntity extends BaseEntity implements Transformable<CategoryModel> {

    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    multiplicator: number;

    @OneToMany(type => ResultsEntity, res => res.category)
    results: ResultsEntity[];

    _transform(): CategoryModel {
        let model = new CategoryModel;
        model.id = this.id;
        model.name = this.name;
        model.multiplicator = this.multiplicator;
        return model;
    }

    _assimilate(origin: CategoryModel) {
        this.id = origin.id;
        this.name = origin.name;
        this.multiplicator = origin.multiplicator;

    }




}