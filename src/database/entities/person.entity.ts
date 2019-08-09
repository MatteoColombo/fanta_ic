import { Entity, Column, PrimaryColumn, BaseEntity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Transformable } from '../transformable.interface';
import { PersonModel } from '../../model/person'
import { ResultsEntity } from './results.entity'

@Entity()
export class PersonEntity extends BaseEntity implements Transformable<PersonModel> {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false, default: 10 })
    price: number;

    @Column({ default: 0 })
    points: number;

    @OneToMany(type => ResultsEntity, res => res.person)
    results: ResultsEntity[];

    _transform(): PersonModel {
        let model = new PersonModel();
        model.id = this.id;
        model.name = this.name;
        model.price = this.price;
        model.points = this.points || 0;
        return model;
    }

    _assimilate(origin: PersonModel) {
        this.id = origin.id;
        this.name = origin.name;
        this.price = origin.price;
        this.points = origin.points || 0;
    }
}