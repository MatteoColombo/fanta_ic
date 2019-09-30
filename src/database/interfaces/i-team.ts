import { IRepo } from "./i-repo";
import { TeamModel } from "../../model/team";

export interface ITeam extends IRepo {

    getTeam(id: number): Promise<TeamModel>;

    getUserTeam(user: number): Promise<TeamModel>;
    userHasTeam(user: number): Promise<boolean>;

    getTeams(): Promise<TeamModel[]>;
    getTeamsShort(): Promise<TeamModel[]>;

    createTeam(origin: TeamModel, user: number): Promise<TeamModel>;
    updateTeam(origin: TeamModel, user: number): Promise<TeamModel>;

    teamNameIsUsed(name: string, user: number): Promise<boolean>;

    updateTeamRank(id: number, rank: number, points: number): Promise<TeamModel>;
}