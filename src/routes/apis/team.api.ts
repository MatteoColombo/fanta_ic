import { Deserialize } from "cerialize";
import { Router } from "express";
import passport from "passport";
import { getCustomRepository } from "typeorm";
import { TeamRepository } from "../../database/repos/team.repository";
import { TeamModel } from "../../model/team";
import { isLoggedIn } from "../middlewares/auth.middleware";
import * as midd from "../middlewares/team.middlewares";

const router: Router = Router();

router.post("/", isLoggedIn, midd.teamEditIsOpen, midd.userHasNoTeam,
    midd.requestHasTeam, midd.teamHasName, midd.verifyPersons,
    midd.checkPointsZero, midd.checkTeamPrices, async (req, res) => {
        try {
            let model: TeamModel = Deserialize(req.body.team, TeamModel);
            const repo: TeamRepository = getCustomRepository(TeamRepository);
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

router.get("/exists", isLoggedIn, async (req, res) => {
    let query: string = (req.query.name || "").trim();
    if (query !== "") {
        let repo: TeamRepository = getCustomRepository(TeamRepository);
        let exists: boolean = await repo.getIfNameIsUsed(query, req.user.id);
        res.status(200).json({ "exists": exists });
    } else {
        res.status(400).json({ "error": "BAD_REQUEST" });
    }
});
export { router };
