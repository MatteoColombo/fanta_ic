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
        title: "Classifica - FantaIC", user: req.user,
        teams
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
    const creation_closes: Date = new Date(config.game.creation_closes.year, (config.game.creation_closes.month - 1), config.game.creation_closes.day, config.game.creation_closes.hour, config.game.creation_closes.minute);
    const creation_opens: Date = new Date(config.game.creation_opens.year, (config.game.creation_opens.month - 1), config.game.creation_opens.day, config.game.creation_opens.hour, config.game.creation_opens.minute);
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
        const teams: TeamEntity[] = await getCustomRepository(TeamRepository).getTeams(false);
        res.render("adminpage", {
            title: "Admin - FantaIC",
            user: req.user,
            import_results: false,
            import_data: false,
            teams: teams.map((t) => t._transform())
        });
    }
});

export { router };
