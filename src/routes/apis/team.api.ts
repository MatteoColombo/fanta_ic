import { Router } from "express";
import passport from 'passport';
import { isGuest, isLoggedIn } from "../middlewares/auth.middleware";
import { TeamModel } from "../../model/team";
import { Deserialize } from "cerialize";
import { TeamRepository } from "../../database/repos/team.repository";
import { getCustomRepository } from "typeorm";
import { teamHasName, requestHasTeam, verifyPersons, checkPointsZero, teamEditIsOpen, checkTeamPrices, userHasNoTeam} from "../middlewares/team.middlewares";

const router: Router = Router();

//TODO add login requirement



router.post("/", /* isLoggedIn,*/ teamEditIsOpen, userHasNoTeam,
    requestHasTeam, teamHasName, verifyPersons,
    checkPointsZero, checkTeamPrices, async (req, res) => {
        try {
            let model: TeamModel = Deserialize(req.body.team, TeamModel);
            let repo: TeamRepository = getCustomRepository(TeamRepository);
            //TODO remove 0
            model = (await repo.createTeam(model, 397 /*req.user.id*/))._transform();
            res.status(200).json(model);
        } catch (e) {
            if (e.code == "ER_DUP_ENTRY") {
                res.status(400).json({ "error": "ER_DUP_ENTRY" });
            } else {
                res.status(400).json({ "error": e.message });
            }
        }
    });

    router.put("/", /* isLoggedIn,*/ teamEditIsOpen,
    requestHasTeam, teamHasName, verifyPersons,
    checkPointsZero, checkTeamPrices, async (req, res) => {
        try {
            let model: TeamModel = Deserialize(req.body.team, TeamModel);
            let repo: TeamRepository = getCustomRepository(TeamRepository);
            //TODO remove 0
            model = (await repo.updateTeam(model, 397 /*req.user.id*/))._transform();
            res.status(200).json(model);
        } catch (e) {
            if (e.code == "ER_DUP_ENTRY") {
                res.status(400).json({ "error": "ER_DUP_ENTRY" });
            } else {
                res.status(400).json({ "error": e.message });
            }
        }
    });


export { router }

