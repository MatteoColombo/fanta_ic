import { EntityRepository, Like, getCustomRepository, Not, Any, IsNull } from "typeorm";
import { PersonEntity } from "../entities/person.entity";
import { BaseCommonRepository } from "../BaseCommonRepository";


@EntityRepository(PersonEntity)
export class PersonRepository extends BaseCommonRepository<PersonEntity>{

    entityIdentifier = "PersonRepository";

    public async InitDefaults(): Promise<void>{
        
    }

    public async getPersonById(id: number): Promise<PersonEntity>{
        return this.repository.findOne(id);
    }
    
    public async getPersons(): Promise<PersonEntity[]> {
        return this.repository.find({ order: { name: "ASC" } });
    }

}