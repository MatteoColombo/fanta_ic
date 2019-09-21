import { Deserialize } from "cerialize";
import express from "express";
import passport from "passport";
import { getCustomRepository } from "typeorm";
import { PersonRepository } from "../../database/repos/person.repository";
import { TeamRepository } from "../../database/repos/team.repository";
import { UserRepository } from "../../database/repos/user.repository";
import { TeamModel } from "../../model/team";
import { config } from "../../secrets/config";

async function userHasNoTeam(req, res, next) {
    // TODO remove 0
    const hasTeam: boolean = await getCustomRepository(UserRepository).userHasTeam(req.user.id);
    if (!hasTeam && req.body.team.id === undefined) {
        next();
    } else {
        res.status(403).json({ error: "USER_ALREADY_HAS_A_TEAM" });
    }
}

async function userHasTeam(req, res, next) {
    // TODO remove 0
    const hasTeam: boolean = await getCustomRepository(UserRepository).userHasTeam(req.user.id);
    if (hasTeam) {
        next();
    } else {
        res.status(403).json({ error: "USER_HAS_NO_TEAM" });
    }
}

function requestHasTeam(req, res, next) {
    const team: TeamModel = Deserialize(req.body.team, TeamModel);
    if (req.body.team !== null && req.body.team !== undefined) {
        next();
    } else {
        res.status(400).json({ error: "BAD_REQUEST" });
    }
}

function teamHasName(req, res, next) {
    const name: string = req.body.team.name;
    if (name) {
        next();
    } else {
        res.status(400).json({ error: "MISSING_TEAM_NAME" });
    }
}

async function verifyPersons(req, res, next) {
    const team: TeamModel = Deserialize(req.body.team, TeamModel);
    if (team.cubers instanceof Array) {
        const ids: number[] = team.cubers.map((c) => Number(c.id));
        const exist: boolean = await getCustomRepository(PersonRepository).checkIfPersonsExist(ids);
        if (exist) {
            next();
        } else {
            res.status(400).json({ error: "INVALID_TEAM_MEMBERS" });
        }
    } else {
        res.status(400).json({ error: "MISSING_TEAM_MEMBERS" });
    }
}

function checkPointsZero(req, res, next) {
    req.body.team.points = 0;
    next();
}

function teamEditIsOpen(req, res, next) {
    const close: Date = new Date(config.game.creation_closes.year,
        config.game.creation_closes.month,
        config.game.creation_closes.day,
        config.game.creation_closes.hour,
        config.game.creation_closes.minute);
    const now: Date = new Date();
    if (now < close) {
        next();
    } else {
        res.status(403).json({ error: "TEAM_EDIT_CLOSE" });
    }
}

async function checkTeamPrices(req, res, next) {
    const sum: number = await getCustomRepository(PersonRepository).getTeamPrice(req.body.team.cubers.map((c) => Number(c.id)));
    if (sum <= config.game.budget) {
        next();
    } else {
        res.status(400).json({ error: "TEAM_OVER_BUDGET" });
    }
}

export { teamHasName, requestHasTeam, verifyPersons, checkPointsZero, teamEditIsOpen, checkTeamPrices, userHasNoTeam, userHasTeam };
