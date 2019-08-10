import { EntityRepository, Like, getCustomRepository, Not, Any, IsNull, MinKey } from "typeorm";
import { PersonEntity } from "../entities/person.entity";
import { BaseCommonRepository } from "../BaseCommonRepository";
import { ResultsRepository } from "./results.repository";
import { ResultsEntity } from "../entities/results.entity";
import { PersonModel } from "../../model/person";


@EntityRepository(PersonEntity)
export class PersonRepository extends BaseCommonRepository<PersonEntity>{

    entityIdentifier = "PersonRepository";

    public async InitDefaults(): Promise<void> {

    }

    public async getPersonById(id: number): Promise<PersonEntity> {
        return this.repository.findOne(id);
    }

    public async getPersonByName(name: string): Promise<PersonEntity> {
        return this.repository.findOne({ where: { name: name } });
    }


    public async getPersons(): Promise<PersonEntity[]> {
        return this.repository.find({ order: { points: "DESC" } });
    }

    public async updateUserPoints(): Promise<void> {
        let resultRepo = getCustomRepository(ResultsRepository);
        let persons: PersonEntity[] = await this.getPersons();
        for (let p of persons) {
            let results: ResultsEntity[] = await resultRepo.getResultsByPerson(p);
            results = results.sort((a, b) => (b.points - a.points));
            p.points = 0;
            for (let i = 0; i < Math.min(3, results.length); i++) {
                p.points += results[i].points;
            }
            await this.repository.save(p);
        }
    }

    public async addPerson(origin: PersonModel): Promise<PersonEntity> {
        let entity: PersonEntity = new PersonEntity();
        entity._assimilate(origin);
        return this.repository.save(entity);
    }
}