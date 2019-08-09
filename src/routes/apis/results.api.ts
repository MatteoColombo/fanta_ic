import { Router } from "express";
import passport from 'passport';
import { authMiddleWare } from "../../passport/passport.wca";
import { isOrganizer } from "../middlewares/auth.middleware";
import { config } from "../../secrets/config";
import request from "request-promise";
import { CubecompsResults } from "../../model/cubecomps_result";
import { Deserialize } from "cerialize";
import { checkEvent, checkRound } from "../middlewares/results.middleware";
import { CategoryRepository } from "../../database/repos/category.repository";
import { ResultsRepository } from "../../database/repos/results.repository";
import { CategoryEntity } from "../../database/entities/category.entity";
import { getCustomRepository } from "typeorm";
import { ResultsModel } from "../../model/results";
import { PersonRepository } from "../../database/repos/person.repository";

const router: Router = Router();

router.get("/ciao", (req, res) => {
    res.json({ "ciao": "ciao" });
});

router.get("/import/events/:event/rounds/:round", /*isOrganizer,*/ checkEvent, checkRound, async (req, res) => {
    try {
        let categoryRepo: CategoryRepository = getCustomRepository(CategoryRepository);
        let category: CategoryEntity = await categoryRepo.getCategoryById(req.params.event);
        const url = `https://m.cubecomps.com/api/v1/competitions/${config.cubecomps.competition_id}/events/${category.cubecompsId}/rounds/${req.params.round}`;
        console.log(url);
        let json = await getCubecompsJSON(url);
        json = transformJSON(json);
        let result: CubecompsResults[] = json ? json['results'].map((r) => Deserialize(r, CubecompsResults)) : [];
        result = filterResult(result);
        result = assignPositions(result);
        result = assignPoints(result, category.multiplicator, category.importedRounds + 1);
        incrementImports(category.id);
        await saveResults(result, category);
        await updatePersonPoints();
        //await updateTeamPoints();
        res.status(200).json(result);
    } catch (e) {
        console.log(e);
        res.status(400).json({ "error": "BAD_REQUEST" });
    }
});

function transformJSON(json) {
    if (json['results']) {
        json['results'] = json['results'].map((j) => {
            if (j.mean) {
                j.average = j.mean;
            } else if (!j.average) {
                j.average = 0;
            }
            return j;
        });
    }
    return json;
}

async function getCubecompsJSON(url: string) {
    return request({
        method: "GET",
        uri: url,
        json: true,
    });
}

function filterResult(result: CubecompsResults[]) {
    result = result.filter((r: CubecompsResults) => r.country === "Italy");
    return result.sort((a, b) => (a.position - b.position));
}

function assignPositions(result: CubecompsResults[]) {
    result[0].position = 1;
    for (let i = 1; i < result.length; i++) {
        if (result[i].average === result[i - 1].average && result[i].best === result[i - 1].best) {
            result[i].position = result[i - 1].position;
        } else {
            result[i].position = i + 1;
        }
    }
    return result;
}

function assignPoints(result: CubecompsResults[], multiplicator: number, round: number) {
    result.forEach((r) => {
        if (r.best === "DNF" && round === 1)
            r.points = 0;
        else if (r.position > config.game.at_points)
            r.points = 0;
        else r.points = config.game.points[r.position] * multiplicator;
    });
    return result;
}

async function incrementImports(category: string) {
    getCustomRepository(CategoryRepository).incrementImports(category);
}

async function saveResults(result: CubecompsResults[], category: CategoryEntity) {
    let repo: ResultsRepository = getCustomRepository(ResultsRepository);
    for (let r of result) {
        let model: ResultsModel = r.toResult();
        await repo.insertResult(model, category);
    }
}

async function updatePersonPoints() {
    return getCustomRepository(PersonRepository).updateUserPoints();
}

async function updateTeamPoints() {
    return;
}

export { router } 
