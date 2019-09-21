import { EntityRepository } from "typeorm";
import { UserModel } from "../../model/user";
import { config } from "../../secrets/config";
import { BaseCommonRepository } from "../BaseCommonRepository";
import { UserEntity } from "../entities/user.entity";

@EntityRepository(UserEntity)
export class UserRepository extends BaseCommonRepository<UserEntity> {

    public entityIdentifier = "UserEntity";

    public async InitDefaults(): Promise<void> {
        return;
    }

    public async getUserById(id: number): Promise<UserEntity> {
        return this.repository.findOne(id);
    }

    public async getUsers(): Promise<UserEntity[]> {
        return this.repository.find({ order: { name: "ASC" } });
    }

    public async saveUser(user: UserModel): Promise<UserEntity> {
        if (config.admin.findIndex((id: number) => id === user.id) > -1) {
            user.isOrganizer = true;
        }
        return this.repository.save(this.convertUser(user));
    }

    public async userHasTeam(user: number): Promise<boolean> {
        const u: UserEntity = await this.repository.findOne({ where: { id: user }, relations: ["team"] });
        return u.team != null;
    }

    private convertUser(origin: UserModel): UserEntity {
        const entity: UserEntity = new UserEntity();
        entity._assimilate(origin);
        return entity;
    }
}
