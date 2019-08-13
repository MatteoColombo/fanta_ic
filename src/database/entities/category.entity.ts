import { Entity, Column, PrimaryColumn, BaseEntity,  OneToMany } from 'typeorm';
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

    @Column({nullable:false, default:true})
    sortByAverage: boolean;

    @Column({nullable:false, default:false})
    priceComputed: boolean;

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
        model.sortByAverage = this.sortByAverage || true;
        model.priceComputed= this.priceComputed ||false;
        return model;
    }

    _assimilate(origin: CategoryModel) {
        this.id = origin.id;
        this.name = origin.name;
        this.multiplicator = origin.multiplicator;
        this.cubecompsId = origin.cubecompsId;
        this.rounds = origin.rounds;
        this.importedRounds = origin.importedRounds || 0;
        this.sortByAverage = origin.sortByAverage || true;
        this.priceComputed= origin.priceComputed || false;
    }

}