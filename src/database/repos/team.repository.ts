import { EntityRepository, getCustomRepository } from "typeorm";
import { TeamModel } from "../../model/team";
import { BaseCommonRepository } from "../BaseCommonRepository";
import { PersonEntity } from "../entities/person.entity";
import { TeamEntity } from "../entities/team.entity";
import { UserEntity } from "../entities/user.entity";
import { UserRepository } from "./user.repository";

@EntityRepository(TeamEntity)
export class TeamRepository extends BaseCommonRepository<TeamEntity> {

    public entityIdentifier = "TeamRepository";

    public async InitDefaults(): Promise<void> {
        return;
    }

    public async getTeamById(id: number): Promise<TeamEntity> {
        return this.repository.findOne(id);
    }

    public async getTeams(orderByPoints: boolean): Promise<TeamEntity[]> {
        if (orderByPoints) {
            return this.repository.find({ order: { points: "DESC" }, relations: ["user"] });
        }
        return this.repository.find({ order: { name: "ASC" }, relations: ["user"] });
    }

    public async getUserTeam(user: number): Promise<TeamEntity> {
        return this.repository.createQueryBuilder()
            .select("team").from(TeamEntity, "team")
            .innerJoin("team.user", "user").where("user.id = :id", { id: user })
            .innerJoinAndSelect("team.cubers", "cubers").getOne();
    }

    public async getTeamCubers(id: number): Promise<PersonEntity[]> {
        const team: TeamEntity = await this.repository.findOne({ relations: ["cubers"] });
        return team.cubers.sort((a, b) => a.points - b.points);
    }

    public async createTeam(team: TeamModel, user: number): Promise<TeamEntity> {
        const entity: TeamEntity = await this.getTeamEntity(team, user);
        await this.repository.save(entity);
        return this.getTeamById(entity.id);
    }

    public async updateTeam(team: TeamModel, user: number): Promise<TeamEntity> {
        const oldteam: TeamEntity = await this.repository.createQueryBuilder()
            .select("team").from(TeamEntity, "team")
            .innerJoin("team.user", "user")
            .where("user.id = :id", { id: user })
            .getOne();
        const entity: TeamEntity = await this.getTeamEntity(team, user);
        if (oldteam) { entity.id = oldteam.id; }
        oldteam.cubers = [];
        await this.repository.save(oldteam);
        await this.repository.save(entity);
        return this.getTeamById(entity.id);
    }

    public async computeTeamPoints(): Promise<TeamEntity[]> {
        const teams: TeamEntity[] = await this.repository.find({ relations: ["cubers"] });
        teams.forEach((t: TeamEntity) => t.points = t.cubers.reduce((v, p, i, _) => v + p.points, 0));
        return this.repository.save(teams);
    }

    public async savePositions(teams: TeamEntity[]): Promise<TeamEntity[]> {
        return this.repository.save(teams);
    }

    private async getTeamEntity(origin: TeamModel, user: number): Promise<TeamEntity> {
        const entity: TeamEntity = new TeamEntity();
        entity._assimilate(origin);
        entity.user = await this.getUser(user);
        return entity;
    }

    private async getUser(id: number): Promise<UserEntity> {
        return await getCustomRepository(UserRepository).getUserById(id);
    }

}
