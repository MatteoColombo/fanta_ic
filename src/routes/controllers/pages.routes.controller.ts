import "passport";
import { TeamModel } from "../../model/team";
import { TeamRepository } from "../../database/repos/team.repository";
import { RepoManager } from "../../database/repo-manager";
import { config } from "../../secrets/config";

export function renderHome(req, res) {
    res.render("home", { title: "FantaIC", user: req.user });
}

export function renderLogin(req, res) {
    res.render("login", { title: "Accedi - FantaIC", user: req.user });
}

export function renderRules(req, res) {
    res.render("regulation", { title: "Regolamento - FantaIC", user: req.user })
}

export async function renderLeaderboard(req, res) {
    let repo: TeamRepository = RepoManager.getTeamRepo();
    const teams: TeamModel[] = await repo.getTeams();
    const cc = config.game.creation_closes;
    const creationCloses: Date = new Date(cc.year, (cc.month - 1), cc.day, cc.hour, cc.minute);
    const today: Date = new Date();
    res.render("leaderboard", {
        teams: teams,
        title: "Classifica - FantaIC", user: req.user,
        open: creationCloses < today
    });
}

export async function renderMyTeamPage(req, res) {
    const today: Date = new Date();
    const co = config.game.creation_opens;
    const cc = config.game.creation_closes;
    const creationCloses: Date = new Date(cc.year, (cc.month - 1), cc.day, cc.hour, cc.minute);
    const creationOpens: Date = new Date(co.year, (co.month - 1), co.day, co.hour, co.minute);
    if (today > creationCloses) {
        let tRepo: TeamRepository = RepoManager.getTeamRepo();
        let team: TeamModel = await tRepo.getUserTeam(req.user.id);
        if (team) {
            let max: number = config.game.budget;
            let credits: number = max - team.cubers.reduce((v, p) => v + p.price, 0);
            let perc: number = (credits) / max * 100;
            res.render("myteam", {
                title: "Il mio Team - FantaIC",
                user: req.user,
                team: team,
                perc: perc,
                credits: credits
            });
        } else {

        }
    } else if (today < creationOpens) {
        res.render("error404", { title: "Errore", user: req.user });
    } else {
        res.render("createteam", {
            title: "Crea squadra - FantaIC",
            user: req.user,
        });
    }
}

export async function renderTeamPage(req, res) {
    try {
        const today: Date = new Date();
        const cc = config.game.creation_closes;
        const creationCloses: Date = new Date(cc.year, (cc.month - 1), cc.day, cc.hour, cc.minute);
        let tRepo: TeamRepository = RepoManager.getTeamRepo();
        let team: TeamModel = await tRepo.getTeam(req.params.id);
        let max: number = config.game.budget;
        let credits: number = max - team.cubers.reduce((v, p) => v + p.price, 0);
        let perc: number = (credits) / max * 100;
        if (today > creationCloses) {
            res.render("team", { user: req.user, title: team.name + " - FantaIC", team: team, perc: perc, credits: credits })
        } else throw "NOT OK";
    } catch (e) {
        res.render("error404", { title: "Team non trovato - FantaIC", user: req.user });
    }
}


export async function renderAdminPage(req, res) {
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
        let tRepo: TeamRepository = RepoManager.getTeamRepo();
        const teams: TeamModel[] = await tRepo.getTeams();
        res.render("adminpage", {
            import_data: false,
            import_results: false,
            teams: teams,
            title: "Admin - FantaIC",
            user: req.user
        });
    }
}