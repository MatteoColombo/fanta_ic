import { Deserialize } from "cerialize";
import { Router } from "express";
import passport from "passport";
import { getCustomRepository } from "typeorm";
import { TeamRepository } from "../../database/repos/team.repository";
import { TeamModel } from "../../model/team";
import { isLoggedIn } from "../middlewares/auth.middleware";
import * as midd from "../middlewares/team.middlewares";

const router: Router = Router();

// TODO add login requirement

router.post("/", isLoggedIn, midd.teamEditIsOpen, midd.userHasNoTeam,
    midd.requestHasTeam, midd.teamHasName, midd.verifyPersons,
    midd.checkPointsZero, midd.checkTeamPrices, async (req, res) => {
        try {
            let model: TeamModel = Deserialize(req.body.team, TeamModel);
            const repo: TeamRepository = getCustomRepository(TeamRepository);
            // TODO remove 0
            model = (await repo.createTeam(model, req.user.id))._transform();
            res.status(200).json(model);
        } catch (e) {
            if (e.code === "ER_DUP_ENTRY") {
                res.status(400).json({ error: "ER_DUP_ENTRY" });
            } else {
                res.status(400).json({ error: e.message });
            }
        }
    });

router.put("/", isLoggedIn, midd.teamEditIsOpen,
    midd.requestHasTeam, midd.teamHasName, midd.verifyPersons,
    midd.checkPointsZero, midd.checkTeamPrices, async (req, res) => {
        try {
            let model: TeamModel = Deserialize(req.body.team, TeamModel);
            const repo: TeamRepository = getCustomRepository(TeamRepository);
            model = (await repo.updateTeam(model, req.user.id))._transform();
            res.status(200).json(model);
        } catch (e) {
            if (e.code === "ER_DUP_ENTRY") {
                res.status(400).json({ error: "ER_DUP_ENTRY" });
            } else {
                res.status(400).json({ error: e.message });
            }
        }
    });

export { router };
