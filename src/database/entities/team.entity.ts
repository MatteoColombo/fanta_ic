import {  PrimaryGeneratedColumn, Column, ManyToMany, OneToOne, JoinTable, JoinColumn, Entity } from "typeorm";
import { ITransformable } from "../interfaces/i-transformable";
import { TeamModel } from "../../model/team";
import { CuberEntity } from "./cuber.entity";
import { UserEntity } from "./user.entity";

@Entity()
export class TeamEntity implements ITransformable<TeamModel>{

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false })
    public name: string;

    @Column({ nullable: false, default: 0 })
    public points: number;

    @Column({ nullable: false, default: 0 })
    public rank: number;

    @ManyToMany(type => CuberEntity, cuber => cuber.teams, { eager: true, onDelete: "CASCADE" })
    @JoinTable()
    public cubers: CuberEntity[]

    @OneToOne(type => UserEntity, user => user.team)
    @JoinColumn()
    public owner: UserEntity;




    _transform(): TeamModel {
        let model: TeamModel = new TeamModel();
        model.id = this.id;
        model.name = this.name;
        model.points = this.points;
        model.rank = this.rank;
        model.cubers = this.cubers ? this.cubers.map(c => c._transform()) : [];
        model.owner = this.owner ? this.owner._transform() : null;
        return model;

    }
    _assimilate(origin: TeamModel): void {
        this.id = origin.id;
        this.name = origin.name;
        this.points = origin.points;
        this.rank = origin.rank;
    }


}