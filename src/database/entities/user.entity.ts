import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm';
import { Transformable } from '../transformable.interface';
import { UserModel } from '../../model/user';


@Entity()
export class UserEntity extends BaseEntity implements Transformable<UserModel> {

    @PrimaryColumn({ nullable: false })
    id: number

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    email: string;

    _transform(): UserModel {
        let model: UserModel = new UserModel();
        model.id = this.id;
        model.name = this.name;
        return model;
    }

    _assimilate(origin: UserModel) {
        this.id = origin.id || null;
        this.name = origin.name;
        this.email = origin.email || null;
    }

}