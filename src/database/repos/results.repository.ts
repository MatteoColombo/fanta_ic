import { EntityRepository, getCustomRepository, MoreThan } from "typeorm";
import { ResultsModel } from "../../model/results";
import { BaseCommonRepository } from "../BaseCommonRepository";
import { CategoryEntity } from "../entities/category.entity";
import { PersonEntity } from "../entities/person.entity";
import { ResultsEntity } from "../entities/results.entity";
import { PersonRepository } from "./person.repository";

@EntityRepository(ResultsEntity)
export class ResultsRepository extends BaseCommonRepository<ResultsEntity> {

    public entityIdentifier = "ResultsRepository";

    public async InitDefaults(): Promise<void> {

    }

    public async insertResult(model: ResultsModel, category: CategoryEntity): Promise<ResultsEntity> {
        const person: PersonEntity = await getCustomRepository(PersonRepository).getPersonByName(model.person);
        if (!person) { return null; }
        const entity: ResultsEntity = new ResultsEntity();
        entity._assimilate(model);
        entity.category = category;
        entity.person = person;
        return this.repository.save(entity);
    }

    public async getResultsByPerson(person: PersonEntity): Promise<ResultsEntity[]> {
        return this.repository.find({ where: { person } });
    }

    public async deleteResults(): Promise<void> {
        this.repository.delete({ points: MoreThan(0) });
    }

}
