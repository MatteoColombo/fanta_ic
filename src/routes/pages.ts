import { Router } from "express";
import { isOrganizer, isLoggedInWR, isGuest } from "./middlewares/auth.middleware";
import { renderHome, renderLogin, renderRules, renderLeaderboard } from "./controllers/pages.routes.controller";

const router: Router = Router();

router.get("/", renderHome);

router.get("/login", isGuest, renderLogin);

router.get("/regolamento", renderRules);

router.get("/classifica", renderLeaderboard);
/*



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
        res.render("myteam", {
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


router.get("/team/:id", async (req, res) => {
    try {
        const today: Date = new Date();
        const cc = config.game.creation_closes;
        const creationCloses: Date = new Date(cc.year, (cc.month - 1), cc.day, cc.hour, cc.minute);
        let team: TeamEntity = await getCustomRepository(TeamRepository).getTeamById(req.params.id);
        let max: number = config.game.budget;
        let credits: number = max - team.cubers.reduce((v, p) => v + p.price, 0);
        let perc: number = (credits) / max * 100;
        if (today > creationCloses) {
            res.render("team", { user: req.user, title: team.name + " - FantaIC", team: team._transform(), perc: perc, credits: credits })
        } else throw "NOT OK";
    } catch (e) {
        res.render("error404", { title: "Team non trovato - FantaIC", user: req.user });
    }
});



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
*/
export { router }
