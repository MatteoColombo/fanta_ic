import { getCustomRepository, BaseEntity } from "typeorm";
import { BaseCommonRepository } from "./BaseCommonRepository";
import { CategoryRepository } from "../database/repos/category.repository";

/**
 * Holds all the custom repository that needs to run a custom function
 * check when the database connection is available (init).
 *
 * @export
 * @returns {BaseCommonRepository<BaseEntity>[]}
 */
export function Bootstrap(): Array<BaseCommonRepository<any>> {
        return [
                getCustomRepository(CategoryRepository)
        ];
}
