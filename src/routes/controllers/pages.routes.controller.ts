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