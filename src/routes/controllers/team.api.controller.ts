import { Deserialize } from "cerialize";
import passport from "passport";
import { RepoManager } from "../../database/repo-manager";
import { TeamRepository } from "../../database/repos/team.repository";
import { TeamModel } from "../../model/team";

export async function newTeam(req, res) {
    try {
        let model: TeamModel = Deserialize(req.body.team, TeamModel);
        const repo: TeamRepository = RepoManager.getTeamRepo();
        model = await repo.createTeam(model, req.user.id);
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
        res.status(400).json({ error: "ERROR" });
    }
}

export async function teamExists(req, res) {
    const query: string = (req.query.name || "").trim();
    if (query !== "") {
        if (query.match(/^[A-Za-z0-9àèéìòùÀÈÉÌÒÙ!\s]+$/) && query.length <= 80 ? false : true) {
            res.status(200).json({ exists: true });
        } else {
            const repo: TeamRepository = RepoManager.getTeamRepo();
            const exists: boolean = await repo.teamNameIsUsed(query, req.user.id);
            res.status(200).json({ exists });
        }
    } else {
        res.status(400).json({ error: "BAD_REQUEST" });
    }
}
