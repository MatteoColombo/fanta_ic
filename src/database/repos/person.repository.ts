import { EntityRepository, getCustomRepository, } from "typeorm";
import { PersonModel } from "../../model/person";
import { config } from "../../secrets/config";
import { BaseCommonRepository } from "../BaseCommonRepository";
import { PersonEntity } from "../entities/person.entity";
import { ResultsEntity } from "../entities/results.entity";
import { ResultsRepository } from "./results.repository";

@EntityRepository(PersonEntity)
export class PersonRepository extends BaseCommonRepository<PersonEntity> {

    public entityIdentifier = "PersonRepository";

    public async InitDefaults(): Promise<void> {
        return;
    }

    public async getPersonById(id: number): Promise<PersonEntity> {
        return this.repository.findOne(id);
    }

    public async getPersonByName(name: string): Promise<PersonEntity> {
        return this.repository.findOne({ where: { name } });
    }

    public async getPersons(orderByPrice: boolean): Promise<PersonEntity[]> {
        if (orderByPrice) { return this.repository.find({ order: { price: "DESC", name: "ASC" } }); }
        return this.repository.find({ order: { points: "DESC" } });
    }

    public async updateUserPoints(): Promise<void> {
        const resultRepo = getCustomRepository(ResultsRepository);
        const persons: PersonEntity[] = await this.getPersons(false);
        for (const p of persons) {
            let results: ResultsEntity[] = await resultRepo.getResultsByPerson(p);
            results = results.sort((a, b) => (b.points - a.points));
            p.points = 0;
            for (let i = 0; i < Math.min(config.game.best_n_placements_to_consider, results.length); i++) {
                p.points += results[i].points;
            }
            await this.repository.save(p);
        }
    }

    public async computePersonPrice(): Promise<void> {
        const resultRepo = getCustomRepository(ResultsRepository);
        const persons: PersonEntity[] = await this.getPersons(false);
        for (const p of persons) {
            let results: ResultsEntity[] = await resultRepo.getResultsByPerson(p);
            results = results.sort((a, b) => (b.points - a.points));
            p.price = 0;
            for (let i = 0; i < Math.min(config.game.best_n_placements_to_consider, results.length); i++) {
                p.price += results[i].points;
            }
            if (p.price < config.game.default_price) { p.price = config.game.default_price; }
            await this.repository.save(p);
        }
    }

    public async addPerson(origin: PersonModel): Promise<PersonEntity> {
        const entity: PersonEntity = new PersonEntity();
        entity._assimilate(origin);
        return this.repository.save(entity);
    }

    public async deletePersons(): Promise<void> {
        await getCustomRepository(ResultsRepository).deleteResults();
        this.repository.createQueryBuilder()
            .delete().from(PersonEntity).where("1").execute();
    }

    public async getTeamPrice(ids: number[]): Promise<number> {
        const persons: PersonEntity[] = await this.repository.findByIds(ids);
        return persons.reduce((a, b) => a + b.price, 0);
    }

    public async checkIfPersonsExist(ids: number[]): Promise<boolean> {
        const members: PersonEntity[] = await this.repository.findByIds(ids);
        return members.length === config.game.competitors_per_team;
    }
}
