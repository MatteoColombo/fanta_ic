import { EntityRepository, Like, getCustomRepository, Not, Any, IsNull } from "typeorm";
import { TeamEntity } from "../entities/team.entity";
import { BaseCommonRepository } from "../BaseCommonRepository";


@EntityRepository(TeamEntity)
export class TeamRepository extends BaseCommonRepository<TeamEntity>{

    entityIdentifier = "TeamRepository";

    public async InitDefaults(): Promise<void>{
    }

    public async getTeamById(id: number): Promise<TeamEntity>{
        return this.repository.findOne(id);
    }
    
    public async getTeams(): Promise<TeamEntity[]> {
        return this.repository.find({ order: { name: "ASC" } });
    }

}