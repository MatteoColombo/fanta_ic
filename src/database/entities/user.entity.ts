import { Entity, Column, PrimaryColumn, BaseEntity, OneToOne, JoinColumn } from 'typeorm';
import { Transformable } from '../transformable.interface';
import { UserModel } from '../../model/user';
import { TeamEntity } from './team.entity'


@Entity()
export class UserEntity extends BaseEntity implements Transformable<UserModel> {

    @PrimaryColumn({ nullable: false })
    id: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    isOrganizer: boolean;

    @OneToOne(type => TeamEntity, { cascade: true }, )
    @JoinColumn() 
    team: TeamEntity;


    _transform(): UserModel {
        let model: UserModel = new UserModel();
        model.id = this.id;
        model.name = this.name;
        model.isOrganizer = this.isOrganizer;
        return model;
    }

    _assimilate(origin: UserModel) {
        this.id = origin.id;
        this.name = origin.name;
        this.isOrganizer = origin.isOrganizer;
    }

}