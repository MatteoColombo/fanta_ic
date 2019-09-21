import { Router } from "express";
import { getCustomRepository } from "typeorm";
import { TeamEntity } from "../database/entities/team.entity";
import { TeamRepository } from "../database/repos/team.repository";
import { config } from "../secrets/config";
import { isOrganizer } from "./middlewares/auth.middleware";

const router: Router = Router();

router.get("/", (req, res) => res.render("home", { title: "FantaIC", user: req.user }));

router.get("/regolamento", (req, res) => res.render("regulation", { title: "Regolamento - FantaIC", user: req.user }));

router.get("/classifica", async (req, res) => {
    const teams: TeamEntity[] = await getCustomRepository(TeamRepository).getTeams(true);
    res.render("leaderboard", {
        teams,
        title: "Classifica - FantaIC", user: req.user
    });
});

router.get("/crea", async (req, res) => {
    res.render("createteam", {
        title: "Crea squadra - FantaIC",
        user: req.user,
    });
});

router.get("/admin", isOrganizer, async (req, res) => {
    const today: Date = new Date();
    const co = config.game.creation_opens;
    const cc = config.game.creation_closes;
    const creationCloses: Date = new Date(cc.year, (cc.month - 1), cc.day, cc.hour, cc.minute);
    const creationOpens: Date = new Date(co.year, (co.month - 1), co.day, co.hour, co.minute);
    if (today > creationCloses) {
        res.render("adminpage", {
            import_data: false,
            import_results: true,
            title: "Admin - FantaIC",
            user: req.user
        });
    } else if (today < creationOpens) {
        res.render("adminpage", {
            import_data: true,
            import_results: false,
            title: "Admin - FantaIC",
            user: req.user,
        });
    } else {
        const teams: TeamEntity[] = await getCustomRepository(TeamRepository).getTeams(false);
        res.render("adminpage", {
            import_data: false,
            import_results: false,
            teams: teams.map((t) => t._transform()),
            title: "Admin - FantaIC",
            user: req.user
        });
    }
});

export { router };
