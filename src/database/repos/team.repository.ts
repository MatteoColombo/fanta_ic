import { EntityRepository, getCustomRepository } from "typeorm";
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

    public async getTeams(orderByPoints: boolean): Promise<TeamEntity[]> {
        if (orderByPoints)
            return this.repository.find({ order: { points: "DESC" } });
        return this.repository.find({ order: { name: "ASC" } });
    }

    public async getUserTeam(user: number): Promise<TeamEntity> {
        return this.repository.createQueryBuilder()
            .select("team").from(TeamEntity, "team")
            .innerJoin("team.user", "user").where("user.id = :id", { id: user }).getOne();
    }

    public async createTeam(team: TeamModel, user: number): Promise<TeamEntity> {
        let entity: TeamEntity = await this.getTeamEntity(team, user);
        await this.repository.save(entity);
        return this.getTeamById(entity.id);
    }

    public async updateTeam(team: TeamModel, user: number): Promise<TeamEntity> {
        let oldteam: TeamEntity = await this.repository.createQueryBuilder()
            .select("team").from(TeamEntity, "team")
            .innerJoin("team.user", "user")
            .where("user.id = :id", { id: user })
            .getOne();
        let entity: TeamEntity = await this.getTeamEntity(team, user);
        if (oldteam) entity.id = oldteam.id;

        await this.repository.save(entity);
        return this.getTeamById(entity.id);
    }

    private async getTeamEntity(origin: TeamModel, user: number): Promise<TeamEntity> {
        let entity: TeamEntity = new TeamEntity();
        entity._assimilate(origin);
        entity.user = await this.getUser(user);
        return entity;
    }

    private async getUser(id: number): Promise<UserEntity> {
        return await getCustomRepository(UserRepository).getUserById(id);
    }

}