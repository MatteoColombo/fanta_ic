import { getCustomRepository } from "typeorm";
import { CuberRepository } from "./repos/cuber.repository";
import { EventRepository } from "./repos/event.repository";
import { ResultRepository } from "./repos/result.repository";
import { TeamRepository } from "./repos/team.repository";
import { UserRepository } from "./repos/user.repository";

export class RepoManager {

    public static getUserRepo() {
        return getCustomRepository(UserRepository);
    }

    public static getTeamRepo() {
        return getCustomRepository(TeamRepository);
    }

    public static getEventRepo() {
        return getCustomRepository(EventRepository);
    }

    public static getCuberRepo() {
        return getCustomRepository(CuberRepository);
    }

    public static getResultRepo() {
        return getCustomRepository(ResultRepository);
    }
}
