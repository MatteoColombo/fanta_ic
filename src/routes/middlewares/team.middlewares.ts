import express from "express";
import passport from "passport";
import { RepoManager } from "../../database/repo-manager";
import { CuberRepository } from "../../database/repos/cuber.repository";
import { TeamRepository } from "../../database/repos/team.repository";
import { CuberModel } from "../../model/cuber";
import { TeamModel } from "../../model/team";
import { config } from "../../secrets/config";

export async function checkNewTeam(req, res, next) {
    const cc = config.game.creation_closes;
    const co = config.game.creation_opens;
    const close: Date = new Date(cc.year, cc.month - 1, cc.day, cc.hour, cc.minute);
    const open: Date = new Date(co.year, co.month - 1, co.day, co.hour, co.minute);
    const now: Date = new Date();
    const user: number = Number(req.user.id);
    if (now < close && now > open) {
        try {
            const tRepo: TeamRepository = RepoManager.getTeamRepo();
            const hasTeam: boolean = await tRepo.userHasTeam(user);

            if (hasTeam) { throw new Error("USER_HAS_A_TEAM"); }
            if (!req.body.team) { throw new Error("TEAM_NOT_FOUND"); }

            const team: TeamModel = new TeamModel();
            team.name = req.body.team.name.trim();
            req.body.team.name = req.body.team.name.trim();

            const nameExists: boolean = await tRepo.teamNameIsUsed(team.name, user);
            if (nameExists) { throw new Error("NAME_ALREADY_USED"); }

            if (team.name.match(/^[A-Za-z0-9àèéìòùÀÈÉÌÒÙ!\s]+$/) ? false : true) { throw new Error("BAD_NAME"); }

            team.cubers = req.body.team.cubers.reduce((arr, c) => {
                const index: number = arr.findIndex((cuber) => cuber.id === c.id);
                if (index === -1) {
                    const cuber: CuberModel = new CuberModel();
                    cuber.id = c.id;
                    arr.push(c);
                }
                return arr;
            }, []);

            if (team.cubers.length !== config.game.competitors_per_team) { throw new Error("BAD_TEAM"); }

            const cRepo: CuberRepository = RepoManager.getCuberRepo();
            const cExists: boolean = await cRepo.cubersExist(team.cubers.map((c) => c.id));
            if (!cExists) { throw new Error("INVALID_CUBERS"); }

            const price: number = await cRepo.getCubersPrice(team.cubers.map((c) => c.id));
            if (price > config.game.budget) { throw new Error("PRICE_OVER_BUDGET"); }

            next();
        } catch (e) {
            res.status(400).json({ error: e });
        }
    } else {
        res.status(403).json({ error: "TEAM_EDIT_CLOSE" });
    }
}

export async function checkUpdateTeam(req, res, next) {
    const cc = config.game.creation_closes;
    const co = config.game.creation_opens;
    const close: Date = new Date(cc.year, cc.month - 1, cc.day, cc.hour, cc.minute);
    const open: Date = new Date(co.year, co.month - 1, co.day, co.hour, co.minute);
    const now: Date = new Date();
    const user: number = Number(req.user.id);
    if (now < close && now > open) {
        try {
            const tRepo: TeamRepository = RepoManager.getTeamRepo();

            if (!req.body.team) { throw new Error("TEAM_NOT_FOUND"); }

            const team: TeamModel = new TeamModel();
            team.name = req.body.team.name.trim();
            req.body.team.name = req.body.team.name.trim();

            const nameExists: boolean = await tRepo.teamNameIsUsed(team.name, user);
            if (nameExists) { throw new Error("NAME_ALREADY_USED"); }

            if (team.name.match(/^[A-Za-z0-9àèéìòùÀÈÉÌÒÙ!\s]+$/) ? false : true) { throw new Error("BAD_NAME"); }

            team.cubers = req.body.team.cubers.reduce((arr, c) => {
                const index: number = arr.findIndex((cuber) => cuber.id === c.id);
                if (index === -1) {
                    const cuber: CuberModel = new CuberModel();
                    cuber.id = c.id;
                    arr.push(c);
                }
                return arr;
            }, []);

            if (team.cubers.length !== config.game.competitors_per_team) { throw new Error("BAD_TEAM"); }

            const cRepo: CuberRepository = RepoManager.getCuberRepo();
            const cExists: boolean = await cRepo.cubersExist(team.cubers.map((c) => c.id));
            if (!cExists) { throw new Error("INVALID_CUBERS"); }

            const price: number = await cRepo.getCubersPrice(team.cubers.map((c) => c.id));
            if (price > config.game.budget) { throw new Error("PRICE_OVER_BUDGET"); }

            next();
        } catch (e) {
            res.status(400).json({ error: e });
        }
    } else {
        res.status(403).json({ error: "TEAM_EDIT_CLOSE" });
    }
}
