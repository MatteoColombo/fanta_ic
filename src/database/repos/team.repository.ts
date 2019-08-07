import { EntityRepository, Like, getCustomRepository, Not, Any, IsNull } from "typeorm";
import { TeamEntity } from "../entities/team.entity";
import { BaseCommonRepository } from "../BaseCommonRepository";
import { TeamModel } from "../../model/team";
import { UserEntity } from "../entities/user.entity";
import { UserRepository } from "./user.repository";


@EntityRepository(TeamEntity)
export class TeamRepository extends BaseCommonRepository<TeamEntity>{

    entityIdentifier = "TeamRepository";

    public async InitDefaults(): Promise<void> {
    }

    public async getTeamById(id: number): Promise<TeamEntity> {
        return this.repository.findOne(id);
    }

    public async getTeams(): Promise<TeamEntity[]> {
        return this.repository.find({ order: { name: "ASC" } });
    }

    public async createTeam(team: TeamModel, user: number): Promise<TeamEntity> {
        let entity: TeamEntity = await this.repository.save(this.getTeamEntity(team));
        return this.getTeamById(entity.id);
    }

    private getTeamEntity(origin: TeamModel): TeamEntity {
        let entity: TeamEntity = new TeamEntity();
        entity._assimilate(origin);
        return entity;
    }

    private async getUser(id: number): Promise<UserEntity> {
        return await getCustomRepository(UserRepository).getUserById(id);
    }
}