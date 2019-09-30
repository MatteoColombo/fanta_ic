import { AbstractRepository, EntityRepository } from "typeorm";
import { TeamEntity } from "../entities/team.entity";
import { ITeam } from "../interfaces/i-team";
import { TeamModel } from "../../model/team";
import { UserEntity } from "../entities/user.entity";

@EntityRepository(TeamEntity)
export class TeamRepository extends AbstractRepository<TeamEntity> implements ITeam {

    initDefaults(): void {
        return;
    }

    public async    getTeam(id: number): Promise<TeamModel> {
        let team: TeamEntity = await this.repository.findOne(id);
        return this.entityToModel(team);
    }

    public async getUserTeam(user: number): Promise<TeamModel> {
        let team: TeamEntity = await this.repository.createQueryBuilder()
            .select("team").from(TeamEntity, "team")
            .innerJoinAndSelect("team.cubers", "cubers")
            .where("user.id = :id", { id: user })
            .getOne();
        return this.entityToModel(team);
    }

    public async userHasTeam(user: number): Promise<boolean> {
        let count: number = await this.repository.createQueryBuilder()
            .select("team").from(TeamEntity, "team")
            .innerJoin("team.owner", "user")
            .getCount();
        return count > 0;
    }

    public async getTeams(): Promise<TeamModel[]> {
        let teams: TeamEntity[] = await this.repository.find({ order: { rank: "ASC", name: "ASC" } });
        return teams.map(t => this.entityToModel(t));
    }

    public async getTeamsShort(): Promise<TeamModel[]> {
        let teams: TeamEntity[] = await this.repository.createQueryBuilder()
            .select("team").from(TeamEntity, "team")
            .orderBy("rank", "ASC").addOrderBy("name", "ASC")
            .getMany();
        return teams.map(t => this.entityToModel(t));
    }

    public async createTeam(origin: TeamModel, user: number): Promise<TeamModel> {
        let team: TeamEntity = this.modelToEntity(origin);
        team.owner = new UserEntity();
        team.owner.id = user;
        team = await this.repository.save(team);
        return this.entityToModel(team);
    }

    public async updateTeam(origin: TeamModel, user: number): Promise<TeamModel> {
        let oldTeam: TeamEntity = await this.repository.createQueryBuilder()
            .select("team").from(TeamEntity, "team")
            .innerJoin("team.cubers", "cubers")
            .where("user.id = :id", { id: user })
            .getOne();
        if (oldTeam) {
            origin.id = oldTeam.id
        }
        let team: TeamEntity = this.modelToEntity(origin);
        team.owner = new UserEntity();
        team.owner.id = user;
        team = await this.repository.save(team);
        return this.entityToModel(team);
    }

    public async teamNameIsUsed(name: string, user: number): Promise<boolean> {
        let count: number = await this.repository.createQueryBuilder()
            .select("team").from(TeamEntity, "team")
            .innerJoin("team.owner", "user")
            .where("team.name = :name", { name: name })
            .andWhere("user.id != user", { user: user })
            .getCount();
        return count > 0;
    }

    public async updateTeamRank(id: number, rank: number, points: number): Promise<TeamModel> {
        let team: TeamEntity = await this.repository.findOne(id);
        team.points = points;
        team.rank = rank;
        team = await this.repository.save(team);
        return this.entityToModel(team);
    }


    private entityToModel(origin: TeamEntity): TeamModel {
        return origin._transform();
    }

    private modelToEntity(origin: TeamModel): TeamEntity {
        let entity: TeamEntity = new TeamEntity();
        entity._assimilate(origin);
        return entity;
    }





}