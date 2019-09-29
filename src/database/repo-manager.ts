import { UserRepository } from "./repos/user.repository";
import { TeamRepository } from "./repos/team.repository";
import { EventRepository } from "./repos/event.repository";
import { CuberRepository } from "./repos/cuber.repository";
import { ResultRepository } from "./repos/result.repository";
import { getCustomRepository } from "typeorm";

export class RepoManager {

    static getUserRepo() {
        return getCustomRepository(UserRepository);
    }

    static getTeamRepo() {
        return getCustomRepository(TeamRepository);
    }

    static getEventRepo() {
        return getCustomRepository(EventRepository);
    }

    static getCuberRepo() {
        return getCustomRepository(CuberRepository);
    }

    static getResultRepo() {
        return getCustomRepository(ResultRepository);
    }
}