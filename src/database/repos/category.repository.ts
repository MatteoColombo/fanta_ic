import { EntityRepository, getCustomRepository } from "typeorm";
import { CategoryEntity } from "../entities/category.entity";
import { BaseCommonRepository } from "../BaseCommonRepository";
import { events } from "../init_files/events";

@EntityRepository(CategoryEntity)
export class CategoryRepository extends BaseCommonRepository<CategoryEntity>{

    entityIdentifier: string = "CategoryRepository";

    public async InitDefaults(): Promise<void> {

        let repo: CategoryRepository = getCustomRepository(CategoryRepository);
        for (let e of events) {
            let category: CategoryEntity = new CategoryEntity();
            category.id = e.id;
            category.name = e.name;
            category.cubecompsId = e.cubecomps_id;
            category.multiplicator = e.multiplicator;
            category.rounds = e.rounds;
            category.sortByAverage = e.sortByAverage;
            await this.repository.save(category);
        };

    }

    public async checkIfEventExists(id: string): Promise<boolean> {
        return await this.repository.count({ where: { id: id } }) > 0;
    }

    public async getCategoryById(id: string): Promise<CategoryEntity> {
        return this.repository.findOne(id);
    }

    public async getCategories(): Promise<CategoryEntity[]> {
        return this.repository.find();
    }

    public async getCubecompsId(id: string): Promise<number> {
        let event: CategoryEntity = await this.getCategoryById(id);
        return event.cubecompsId;
    }

    public async getCategoryRounds(id: string): Promise<number> {
        let entity: CategoryEntity = await this.repository.findOne(id);
        return entity.rounds;
    }

    public async incrementImports(id: string): Promise<void> {
        let entity: CategoryEntity = await this.repository.findOne(id);
        entity.importedRounds++;
        this.repository.save(entity);
    }
    public async setPriceComputed(id: string): Promise<void> {
        let entity: CategoryEntity = await this.repository.findOne(id);
        entity.priceComputed = true;
        this.repository.save(entity);
    }
}