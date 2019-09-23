import { Router } from "express";
import { getCustomRepository } from "typeorm";
import { TeamEntity } from "../database/entities/team.entity";
import { TeamRepository } from "../database/repos/team.repository";
import { config } from "../secrets/config";
import { isOrganizer, isLoggedInWR, isGuest } from "./middlewares/auth.middleware";

const router: Router = Router();

router.get("/", (req, res) => res.render("home", { title: "FantaIC", user: req.user }));

router.get("/regolamento", (req, res) => res.render("regulation", { title: "Regolamento - FantaIC", user: req.user }));

router.get("/classifica", async (req, res) => {
    const teams: TeamEntity[] = await getCustomRepository(TeamRepository).getTeams(true);
    const cc = config.game.creation_closes;
    const creationCloses: Date = new Date(cc.year, (cc.month - 1), cc.day, cc.hour, cc.minute);
    const today: Date = new Date();
    res.render("leaderboard", {
        teams: teams,
        title: "Classifica - FantaIC", user: req.user,
        open: creationCloses < today
    });
});

router.get("/team", isLoggedInWR, async (req, res) => {
    const today: Date = new Date();
    const co = config.game.creation_opens;
    const cc = config.game.creation_closes;
    const creationCloses: Date = new Date(cc.year, (cc.month - 1), cc.day, cc.hour, cc.minute);
    const creationOpens: Date = new Date(co.year, (co.month - 1), co.day, co.hour, co.minute);
    if (today > creationCloses) {
        let team: TeamEntity = await getCustomRepository(TeamRepository).getUserTeam(req.user.id);
        let max: number = config.game.budget;
        let credits: number = max - team.cubers.reduce((v, p) => v + p.price, 0);
        let perc: number = (credits) / max * 100;
        res.render("team", {
            title: "Il mio Team - FantaIC",
            user: req.user,
            team: team._transform(),
            perc: perc,
            credits: credits
        });
    } else if (today < creationOpens) {
        res.render("error404", { title: "Errore", user: req.user });
    } else {
        res.render("createteam", {
            title: "Crea squadra - FantaIC",
            user: req.user,
        });
    }
});

router.get("/team:id", isLoggedInWR, async (req, res) => {
    res.render("createteam", {
        title: "Crea squadra - FantaIC",
        user: req.user,
    });
});

router.get("/login", isGuest, async (req, res) => res.render("login", {
    title: "Accedi - FantaIC",
    user: req.user,
}));

router.get("/admin", isLoggedInWR, isOrganizer, async (req, res) => {
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
