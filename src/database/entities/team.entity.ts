import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Transformable } from '../transformable.interface';
import { TeamModel } from '../../model/team';
import { PersonEntity } from './person.entity'

@Entity()
export class TeamEntity extends BaseEntity implements Transformable<TeamModel> {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false})
    points: number;

    @ManyToMany(type => PersonEntity)
    @JoinTable()
    cubers: PersonEntity[];

    _transform(): TeamModel {
        let model = new TeamModel();
        model.id = this.id;
        model.name = this.name;
        model.points = this.points;
        for(let i = 0; i < this.cubers.length || 0; i++) {
            model.cubers[i] = this.cubers[i]._transform();
        }
        return model; 
    }

    _assimilate(origin: TeamModel) {
        this.id = origin.id;
        this.name = origin.name;
        this.points = origin.points;
        for(let i = 0; i < origin.cubers.length || 0; i++) {
            this.cubers[i]._assimilate(origin.cubers[i]);
        }
    }
}
