import { BaseEntity, Column,  Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PersonModel } from "../../model/person";
import { config } from "../../secrets/config";
import { ITransformable } from "../transformable.interface";
import { ResultsEntity } from "./results.entity";

@Entity()
export class PersonEntity extends BaseEntity implements ITransformable<PersonModel> {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false })
    public name: string;

    @Column({ nullable: false, default: config.game.default_price })
    public price: number;

    @Column({ default: 0 })
    public points: number;

    @OneToMany((type) => ResultsEntity, (res) => res.person)
    public results: ResultsEntity[];

    public _transform(): PersonModel {
        const model = new PersonModel();
        model.id = this.id;
        model.name = this.name;
        model.price = this.price;
        model.points = this.points || 0;
        return model;
    }

    public _assimilate(origin: PersonModel) {
        this.id = origin.id;
        this.name = origin.name;
        this.price = origin.price;
        this.points = origin.points || 0;
    }
}
