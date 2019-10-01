import { TeamModel } from "../../model/team";
import { Deserialize } from "cerialize";
import { RepoManager } from "../../database/repo-manager";
import { TeamRepository } from "../../database/repos/team.repository";
import passport from "passport";


export async function newTeam(req, res) {
    try {
        let model: TeamModel = Deserialize(req.body.team, TeamModel);
        const repo: TeamRepository = RepoManager.getTeamRepo();
        model = await repo.createTeam(model, req.user.id)
        res.status(200).json(model);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
}

export async function updateTeam(req, res) {
    try {
        let model: TeamModel = Deserialize(req.body.team, TeamModel);
        const repo: TeamRepository = RepoManager.getTeamRepo();
        model = await repo.updateTeam(model, req.user.id);
        res.status(200).json(model);
    } catch (e) {
        console.log(e);
        res.status(400).json({ error: e.message });
    }
}

export async function teamExists(req, res) {
    let query: string = (req.query.name || "").trim();
    if (query !== "") {
        if (query.match(/^[A-Za-z0-9àèéìòùÀÈÉÌÒÙ!\s]+$/) ? false : true) {
            res.status(200).json({ "exists": true });
        } else {
            let repo: TeamRepository = RepoManager.getTeamRepo();
            let exists: boolean = await repo.teamNameIsUsed(query, req.user.id);
            res.status(200).json({ "exists": exists });
        }
    } else {
        res.status(400).json({ "error": "BAD_REQUEST" });
    }
}