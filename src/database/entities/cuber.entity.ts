import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CuberModel } from "../../model/cuber";
import { ITransformable } from "../interfaces/i-transformable";
import { ResultEntity } from "./result.entity";
import { TeamEntity } from "./team.entity";

@Entity()
export class CuberEntity implements ITransformable<CuberModel> {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false, unique: true })
    public name: string;

    @Column({ nullable: true })
    public wcaId: string;

    @Column({ nullable: false, default: 0 })
    public points: number;

    @Column({ nullable: false, default: 10 })
    public price: number;

    @Column({ nullable: false, default: 0 })
    public rank3: number;

    @Column({ nullable: true })
    public photoUrl: string;

    @ManyToMany((type) => TeamEntity, (team) => team.cubers)
    public teams: TeamEntity[];

    @OneToMany((type) => ResultEntity, (result) => result.cuber)
    public results: ResultEntity[];

    public _transform(): CuberModel {
        const model: CuberModel = new CuberModel();
        model.id = this.id;
        model.name = this.name;
        model.wcaId = this.wcaId;
        model.points = this.points;
        model.price = this.price;
        model.rank3 = this.rank3;
        model.photoUrl = this.photoUrl;
        return model;
    }

    public _assimilate(origin: CuberModel): void {
        this.id = origin.id;
        this.name = origin.name;
        this.wcaId = origin.wcaId;
        this.points = origin.points;
        this.price = origin.price;
        this.rank3 = origin.rank3;
        this.photoUrl = origin.photoUrl;
    }

}
