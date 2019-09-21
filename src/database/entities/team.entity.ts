import { BaseEntity, Column, Entity, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PersonModel } from "../../model/person";
import { TeamModel } from "../../model/team";
import { ITransformable } from "../transformable.interface";
import { PersonEntity } from "./person.entity";
import { UserEntity } from "./user.entity";

@Entity()
export class TeamEntity extends BaseEntity implements ITransformable<TeamModel> {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false, unique: true })
    public name: string;

    @Column({ nullable: false })
    public points: number;

    @Column({ nullable: true, default: 0 })
    public position: number;

    @ManyToMany((type) => PersonEntity, { eager: true })
    @JoinTable()
    public cubers: PersonEntity[];

    @OneToOne((type) => UserEntity, (user) => user.team)
    public user: UserEntity;

    public _transform(): TeamModel {
        const model = new TeamModel();
        model.id = this.id;
        model.name = this.name;
        model.points = this.points;
        model.position = this.position;
        model.cubers = this.cubers.map((c: PersonEntity) => c._transform());
        if (this.user) {
            model.ownerId = this.user.id;
            model.ownerName = this.user.name;
        }
        return model;
    }

    public _assimilate(origin: TeamModel) {
        this.id = origin.id;
        this.name = origin.name;
        this.points = origin.points || 0;
        if (origin.cubers) {
            this.cubers = origin.cubers.map((c: PersonModel) => {
                const temp: PersonEntity = new PersonEntity();
                temp._assimilate(c);
                return temp;
            });
        }

    }
}
