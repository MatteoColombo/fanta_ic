import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm';
import { Transformable } from '../transformable.interface';
import { PersonModel } from '../../model/person'

@Entity()
export class PersonEntity extends BaseEntity implements Transformable<PersonModel>{

    @PrimaryColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    price: number;

    _transform(): PersonModel {
        let model = new PersonModel();
        model.id = this.id;
        model.name = this.name;
        model.price = this.price;
        return model;
    }

    _assimilate(origin: PersonModel) {
        this.id = origin.id;
        this.name = origin.name;
        this.price = origin.price;
    }
}