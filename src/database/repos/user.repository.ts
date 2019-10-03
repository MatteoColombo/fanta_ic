import { AbstractRepository, EntityRepository, getCustomRepository } from "typeorm";
import { UserModel } from "../../model/user";
import { config } from "../../secrets/config";
import { UserEntity } from "../entities/user.entity";
import { IUser } from "../interfaces/i-user";

@EntityRepository(UserEntity)
export class UserRepository extends AbstractRepository<UserEntity> implements IUser {

    public async initDefaults(): Promise<void> {
        return;
    }

    public async getUserById(id: number): Promise<UserModel> {
        return this.repository.findOne(id);
    }

    public async saveUser(user: UserModel): Promise<UserModel> {
        if (config.admin.findIndex((id: number) => id === user.id) > -1) {
            user.isOrganizer = true;
        }
        return this.convertAndSave(user);
    }

    private convertUser(origin: UserModel): UserEntity {
        const entity: UserEntity = new UserEntity();
        entity._assimilate(origin);
        return entity;
    }

    private async convertAndSave(origin: UserModel): Promise<UserModel> {
        origin = await this.repository.save(this.convertUser(origin));
        return origin;
    }

}
