import { Router } from "express";
import { isOrganizer } from "./middlewares/auth.middleware";
import { config } from "../secrets/config";
import { TeamEntity } from "../database/entities/team.entity";
import { getCustomRepository } from "typeorm";
import { TeamRepository } from "../database/repos/team.repository";

const router: Router = Router();
const fakeTeam = [{ name: "Ciccio", points: 24, position: 1 }, { name: "Andrea", points: 17, position: 2 },
{ name: "Carlo", points: 5, position: 3 }, { name: "Piero", points: 4, position: 4 }];

router.get("/", (req, res) => res.render("home", { title: "FantaIC", user: req.user }));

router.get("/regolamento", (req, res) => res.render("regulation", { title: "Regolamento - FantaIC", user: req.user }));

router.get("/classifica", (req, res) => res.render("leaderboard", {
    title: "Classifica - FantaIC", user: req.user,
    teams: fakeTeam
}));

router.get("/crea", (req, res) => res.render("createteam", { title: "Crea squadra - FantaIC", user: req.user }));

router.get("/admin", isOrganizer, async (req, res) => {
    let today: Date = new Date();
    let creation_closes: Date = new Date(config.game.creation_closes.year, config.game.creation_closes.month, config.game.creation_closes.day, config.game.creation_closes.hour, config.game.creation_closes.minute);
    let creation_opens: Date = new Date(config.game.creation_opens.year, config.game.creation_opens.month, config.game.creation_opens.day, config.game.creation_opens.hour, config.game.creation_opens.minute);
    if (today > creation_closes) {
        res.render("adminpage", {
            title: "Admin - FantaIC",
            user: req.user,
            import_results: true,
            import_data: false
        });
    } else if (today < creation_opens) {
        res.render("adminpage", {
            title: "Admin - FantaIC",
            user: req.user,
            import_results: false,
            import_data: true
        });
    } else {
        let teams: TeamEntity[] = await getCustomRepository(TeamRepository).getTeams(false);
        res.render("adminpage", {
            title: "Admin - FantaIC",
            user: req.user,
            import_results: false,
            import_data: false,
            teams: teams.map((t)=>t._transform())
        });
    }
});

export { router }