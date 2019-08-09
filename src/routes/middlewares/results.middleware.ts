import * as express from "express";
import { CategoryRepository } from "../../database/repos/category.repository";
import { getCustomRepository } from "typeorm";
import { CategoryEntity } from "../../database/entities/category.entity";


export async function checkEvent(req, res, next) {
    let repo: CategoryRepository = getCustomRepository(CategoryRepository);
    let exists: boolean = await repo.checkIfEventExists(req.params.event);
    if (exists) {
        next();
    } else {
        res.status(404).json({ "error": "NOT_FOUND" });
    }
}

export async function checkRound(req, res, next) {
    let repo: CategoryRepository = getCustomRepository(CategoryRepository);
    let event: CategoryEntity = await repo.getCategoryById(req.params.event);
    let round: number = Number(req.params.round) || 0;
    if (round === (event.importedRounds + 1) && round <= event.rounds) {
        next();
    } else {
        res.status(400).json({ "error": "INVALID_ROUND" });
    }
}