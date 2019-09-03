import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToOne } from 'typeorm';
import { Transformable } from '../transformable.interface';
import { TeamModel } from '../../model/team';
import { PersonEntity } from './person.entity'
import { PersonModel } from '../../model/person';
import { UserEntity } from './user.entity';

@Entity()
export class TeamEntity extends BaseEntity implements Transformable<TeamModel> {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, unique: true })
    name: string;

    @Column({ nullable: false })
    points: number;

    @ManyToMany(type => PersonEntity, { eager: true })
    @JoinTable()
    cubers: PersonEntity[];

    @OneToOne(type => UserEntity, user => user.team)
    user: UserEntity;


    _transform(): TeamModel {
        let model = new TeamModel();
        model.id = this.id;
        model.name = this.name;
        model.points = this.points;
        model.cubers = this.cubers.map((c: PersonEntity) => c._transform());
        if(this.user){
            model.ownerId=this.user.id;
            model.ownerName=this.user.name;
        }
        return model;
    }

    _assimilate(origin: TeamModel) {
        this.id = origin.id;
        this.name = origin.name;
        this.points = origin.points || 0;
        if (origin.cubers) {
            this.cubers = origin.cubers.map((c: PersonModel) => {
                let temp: PersonEntity = new PersonEntity();
                temp._assimilate(c);
                return temp;
            });
        }

    }
}
