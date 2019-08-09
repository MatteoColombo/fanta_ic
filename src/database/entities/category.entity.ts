import { Entity, Column, PrimaryColumn, BaseEntity, JoinTable, OneToMany } from 'typeorm';
import { Transformable } from '../transformable.interface';
import { CategoryModel } from '../../model/category';
import { ResultsEntity } from './results.entity'

@Entity()
export class CategoryEntity extends BaseEntity implements Transformable<CategoryModel> {

    @PrimaryColumn({ nullable: false })
    id: string;

    @Column({ nullable: false })
    name: string;

    @Column()
    cubecompsId: number;

    @Column({ nullable: false, type: "float" })
    multiplicator: number;

    @Column({ nullable: false })
    rounds: number;

    @Column({ nullable: false, default: 0 })
    importedRounds: number;

    @OneToMany(type => ResultsEntity, res => res.category)
    results: ResultsEntity[];

    _transform(): CategoryModel {
        let model = new CategoryModel;
        model.id = this.id;
        model.name = this.name;
        model.cubecompsId = this.cubecompsId;
        model.multiplicator = this.multiplicator;
        model.rounds = this.rounds;
        model.importedRounds = this.importedRounds || 0;
        return model;
    }

    _assimilate(origin: CategoryModel) {
        this.id = origin.id;
        this.name = origin.name;
        this.multiplicator = origin.multiplicator;
        this.cubecompsId = origin.cubecompsId;
        this.rounds = origin.rounds;
        this.importedRounds = origin.importedRounds || 0;
    }

}