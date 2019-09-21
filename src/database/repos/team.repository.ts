import { EntityRepository, getCustomRepository } from "typeorm";
import { TeamEntity } from "../entities/team.entity";
import { BaseCommonRepository } from "../BaseCommonRepository";
import { TeamModel } from "../../model/team";
import { UserEntity } from "../entities/user.entity";
import { UserRepository } from "./user.repository";
import { PersonEntity } from "../entities/person.entity";


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
            return this.repository.find({ order: { points: "DESC" }, relations: ['user'] });
        return this.repository.find({ order: { name: "ASC" }, relations: ['user'] });
    }

    public async getUserTeam(user: number): Promise<TeamEntity> {
        return this.repository.createQueryBuilder()
            .select("team").from(TeamEntity, "team")
            .innerJoin("team.user", "user").where("user.id = :id", { id: user })
            .innerJoinAndSelect("team.cubers","cubers").getOne();
    }

    public async getTeamCubers(id: number): Promise<PersonEntity[]> {
        let team: TeamEntity = await this.repository.findOne({ relations: ['cubers'] });
        return team.cubers.sort((a, b) => a.points - b.points);
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

    public async computeTeamPoints(): Promise<TeamEntity[]> {
        let teams: TeamEntity[] = await this.repository.find({ relations: ['cubers'] });
        teams.forEach((t: TeamEntity) => t.points = t.cubers.reduce((v, p, i, _) => { return v + p.points }, 0));
        return this.repository.save(teams);
    }

    public async savePositions(teams: TeamEntity[]): Promise<TeamEntity[]> {
        return this.repository.save(teams);
    }

}