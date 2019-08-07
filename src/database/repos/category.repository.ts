import { EntityRepository } from "typeorm";
import { CategoryEntity } from "../entities/category.entity";
import { BaseCommonRepository } from "../BaseCommonRepository";


@EntityRepository(CategoryEntity)
export class CategoryRepository extends BaseCommonRepository<CategoryEntity>{

    entityIdentifier: string = "CategoryRepository";

    public async InitDefaults(): Promise<void> {

    }

    public async getCategoryById(id: string): Promise<CategoryEntity> {
        return this.repository.findOne(id);
    }


}