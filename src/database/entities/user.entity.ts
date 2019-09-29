import { Column, Entity, PrimaryColumn, OneToOne } from "typeorm";
import { UserModel } from "../../model/user";
import { ITransformable } from "../interfaces/i-transformable";
import { TeamEntity } from "./team.entity";

@Entity()
export class UserEntity implements ITransformable<UserModel> {

    @PrimaryColumn({ nullable: false })
    public id: number;

    @Column({ nullable: false })
    public name: string;

    @Column({ nullable: false, default: false })
    public isOrganizer: boolean;

    @Column({ nullable: true })
    public wcaId: string;

    @OneToOne(type => TeamEntity, team => team.owner)
    public team: TeamEntity;


    public _transform(): UserModel {
        const model: UserModel = new UserModel();
        model.id = this.id;
        model.name = this.name;
        model.isOrganizer = this.isOrganizer;
        return model;
    }

    public _assimilate(origin: UserModel) {
        this.id = origin.id;
        this.name = origin.name;
        this.isOrganizer = origin.isOrganizer;
    }

}
