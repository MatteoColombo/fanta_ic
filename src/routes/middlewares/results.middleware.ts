import * as express from "express";
import { EventRepository } from "../../database/repos/event.repository";
import { RepoManager } from "../../database/repo-manager";
import { EventModel } from "../../model/event";
;

export async function checkEvent(req, res, next) {
    const repo: EventRepository = RepoManager.getEventRepo();
    const exists: boolean = await repo.eventExists(req.params.event);
    if (exists) {
        next();
    } else {
        res.status(404).json({ error: "NOT_FOUND" });
    }
}

export async function checkRound(req, res, next) {
    const repo: EventRepository = RepoManager.getEventRepo();
    const event: EventModel = await repo.getEvent(req.params.event);
    const round: number = Number(req.params.round) || 0;
    if (round === (event.importedRounds + 1) && round <= event.rounds) {
        next();
    } else {
        res.status(400).json({ error: "INVALID_ROUND" });
    }
}
