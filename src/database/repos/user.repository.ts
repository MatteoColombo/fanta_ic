import { EntityRepository } from "typeorm";
import { UserEntity } from "../entities/user.entity";
import { BaseCommonRepository } from "../BaseCommonRepository";
import { UserModel } from "../../model/user";


@EntityRepository(UserEntity)
export class UserRepository extends BaseCommonRepository<UserEntity>{

    public entityIdentifier = "UserEntity";

    public async InitDefaults(): Promise<void> {
    }

    public async getUserById(id: number): Promise<UserEntity> {
        return this.repository.findOne(id);
    }

    public async getUsers(): Promise<UserEntity[]> {
        return this.repository.find({ order: { name: "ASC" } });
    }

    public async saveUser(user: UserModel): Promise<UserEntity> {
        return this.repository.save(this.convertUser(user));
    }

    public async userHasTeam(user: number): Promise<boolean> {
        let u: UserEntity = await this.repository.findOne({ where: { id: user }, relations: ["team"] });
        return u.team != null;
    }





    private convertUser(origin: UserModel): UserEntity {
        let entity: UserEntity = new UserEntity();
        entity._assimilate(origin);
        return entity;
    }
}