import { Router } from "express";
import passport from 'passport';
import { isGuest, isLoggedIn } from "../middlewares/auth.middleware";
import { TeamModel } from "../../model/team";
import { Deserialize } from "cerialize";
import { TeamRepository } from "../../database/repos/team.repository";
import { getCustomRepository } from "typeorm";
import { teamHasName, requestHasTeam, verifyPersons, checkPointsZero, teamEditIsOpen, checkTeamPrices, userHasNoTeam } from "../middlewares/team.middlewares";

const router: Router = Router();

//TODO add login requirement



router.post("/", /* isLoggedIn,*/ teamEditIsOpen, userHasNoTeam,
    requestHasTeam, teamHasName, verifyPersons,
    checkPointsZero, checkTeamPrices, async (req, res) => {
        /**
         * 1. verificare il login
         *  verificare se l'utente ha già un team -> let it crash
         * 3. controllo dei dati ricevuti
         *       verificare che team sia nella richiesta
         *       deve avere un nome
         *       devono esserci 6 persone 
         *      - il periodo per modificare è attivo
         *       le persone devono esistere
         *       i punti sono nulli o zero 
         *      - la somma dei prezzi è minore del valore massimo
         * 4. costruisci l'oggetto TeamModel
         * 5. salvi l'oggetto
         * 6. restituisci l'oggetto 
         */
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


export { router }

