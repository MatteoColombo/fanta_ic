import { BaseEntity, Column, Entity, OneToMany,  PrimaryColumn } from "typeorm";
import { CategoryModel } from "../../model/category";
import { Transformable } from "../transformable.interface";
import { ResultsEntity } from "./results.entity";

@Entity()
export class CategoryEntity extends BaseEntity implements Transformable<CategoryModel> {

    @PrimaryColumn({ nullable: false })
    public id: string;

    @Column({ nullable: false })
    public name: string;

    @Column()
    public cubecompsId: number;

    @Column({ nullable: false, type: "float" })
    public multiplicator: number;

    @Column({ nullable: false })
    public rounds: number;

    @Column({ nullable: false, default: 0 })
    public importedRounds: number;

    @Column({nullable: false, default: true})
    public sortByAverage: boolean;

    @Column({nullable: false, default: false})
    public priceComputed: boolean;

    @OneToMany((type) => ResultsEntity, (res) => res.category)
    public results: ResultsEntity[];

    public _transform(): CategoryModel {
        const model = new CategoryModel;
        model.id = this.id;
        model.name = this.name;
        model.cubecompsId = this.cubecompsId;
        model.multiplicator = this.multiplicator;
        model.rounds = this.rounds;
        model.importedRounds = this.importedRounds || 0;
        model.sortByAverage = this.sortByAverage || true;
        model.priceComputed = this.priceComputed || false;
        return model;
    }

    public _assimilate(origin: CategoryModel) {
        this.id = origin.id;
        this.name = origin.name;
        this.multiplicator = origin.multiplicator;
        this.cubecompsId = origin.cubecompsId;
        this.rounds = origin.rounds;
        this.importedRounds = origin.importedRounds || 0;
        this.sortByAverage = origin.sortByAverage || true;
        this.priceComputed = origin.priceComputed || false;
    }

}
