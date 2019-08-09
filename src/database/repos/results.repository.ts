import { EntityRepository, Like, getCustomRepository, Not, Any, IsNull } from "typeorm";
import { ResultsEntity } from "../entities/results.entity";
import { BaseCommonRepository } from "../BaseCommonRepository";
import { ResultsModel } from "../../model/results";
import { CategoryEntity } from "../entities/category.entity";
import { PersonEntity } from "../entities/person.entity";
import { PersonRepository } from "./person.repository";


@EntityRepository(ResultsEntity)
export class ResultsRepository extends BaseCommonRepository<ResultsEntity>{

    entityIdentifier = "ResultsRepository";

    public async InitDefaults(): Promise<void> {

    }

    public async insertResult(model: ResultsModel, category: CategoryEntity): Promise<ResultsEntity> {
        let person: PersonEntity = await getCustomRepository(PersonRepository).getPersonByName(model.person);
        if (!person) return null;
        let entity: ResultsEntity = new ResultsEntity();
        entity._assimilate(model);
        entity.category = category;
        entity.person = person;
        return this.repository.save(entity);
    }

    public async getResultsByPerson(person: PersonEntity): Promise<ResultsEntity[]> {
        return this.repository.find({ where: { person: person } });
    }


}