import { getCustomRepository } from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";
import { BaseCommonRepository } from "./BaseCommonRepository";

/**
 * Holds all the custom repository that needs to run a custom function
 * check when the database connection is available (init).
 *
 * @export
 * @returns {BaseCommonRepository<BaseEntity>[]}
 */
export function Bootstrap(): Array<BaseCommonRepository<BaseEntity>> {
    return [
    ];
}
