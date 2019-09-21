import { EntityRepository, getCustomRepository } from "typeorm";
import { BaseCommonRepository } from "../BaseCommonRepository";
import { CategoryEntity } from "../entities/category.entity";
import { events } from "../init_files/events";

@EntityRepository(CategoryEntity)
export class CategoryRepository extends BaseCommonRepository<CategoryEntity> {

    public entityIdentifier: string = "CategoryRepository";

    public async InitDefaults(): Promise<void> {

        const repo: CategoryRepository = getCustomRepository(CategoryRepository);
        for (const e of events) {
            const category: CategoryEntity = new CategoryEntity();
            category.id = e.id;
            category.name = e.name;
            category.cubecompsId = e.cubecomps_id;
            category.multiplicator = e.multiplicator;
            category.rounds = e.rounds;
            category.sortByAverage = e.sortByAverage;
            await this.repository.save(category);
        }

    }

    public async checkIfEventExists(id: string): Promise<boolean> {
        return await this.repository.count({ where: { id } }) > 0;
    }

    public async getCategoryById(id: string): Promise<CategoryEntity> {
        return this.repository.findOne(id);
    }

    public async getCategories(): Promise<CategoryEntity[]> {
        return this.repository.find();
    }

    public async getCubecompsId(id: string): Promise<number> {
        const event: CategoryEntity = await this.getCategoryById(id);
        return event.cubecompsId;
    }

    public async getCategoryRounds(id: string): Promise<number> {
        const entity: CategoryEntity = await this.repository.findOne(id);
        return entity.rounds;
    }

    public async incrementImports(id: string): Promise<void> {
        const entity: CategoryEntity = await this.repository.findOne(id);
        entity.importedRounds++;
        this.repository.save(entity);
    }
    public async setPriceComputed(id: string): Promise<void> {
        const entity: CategoryEntity = await this.repository.findOne(id);
        entity.priceComputed = true;
        this.repository.save(entity);
    }

    public async getImportableRounds(): Promise<CategoryEntity[]> {
        return this.repository.createQueryBuilder()
        .select("cat").from(CategoryEntity, "cat")
        .where("cat.importedRounds < cat.rounds").getMany();

        return [];
    }
}
