import { Router } from "express";
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

router.get("/import/events/:event/rounds/:round", isOrganizer, checkEvent, checkRound, async (req, res) => {
    try {
        let categoryRepo: CategoryRepository = getCustomRepository(CategoryRepository);
        let category: CategoryEntity = await categoryRepo.getCategoryById(req.params.event);
        // Create the url to access cubecomps APIs.
        const url = `https://m.cubecomps.com/api/v1/competitions/${config.cubecomps.competition_id}/events/${category.cubecompsId}/rounds/${req.params.round}`;
        // Download round results from cubecomps.
        let json = await getCubecompsJSON(url);
        // Make sure that there is always a "average" key.
        json = transformJSON(json);
        // Deserialize the json into an array of objects
        let result: CubecompsResults[] = json ? json['results'].map((r) => Deserialize(r, CubecompsResults)) : [];
        // Filter, assign positions and points.
        result = filterResult(result);
        result = assignPositions(result);
        result = assignPoints(result, category.multiplicator, category.importedRounds + 1);
        // Save
        await saveResults(result, category);
        await updatePersonPoints();
        /*await updateTeamPoints();*/
        await incrementImports(category.id);
        res.status(200).json(result);
    } catch (e) {
        console.log(e);
        res.status(400).json({ "error": "BAD_REQUEST" });
    }
});

/**
 * Download results from Cubecomps as a JSON file.
 * 
 * @param url A string representing the URL from which we want to download the json file.
 */
async function getCubecompsJSON(url: string) {
    return request({
        method: "GET",
        uri: url,
        json: true,
    });
}

/**
 * Makes sure that each result has an "average" key.
 * If the round format is mo3 or bo3, the value of key "mean" is copied into average.
 * If the result has neither mean nor average, an "average" key is created with value 0.
 * 
 * @param json a json object received from cubecomps with the round results.
 */
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

/**
 * Removes foreign people and sorts the array by position.
 * 
 * @param result 
 */
function filterResult(result: CubecompsResults[]) {
    return result.filter((r: CubecompsResults) => r.country === "Italy").sort((a, b) => (a.position - b.position));
}

/**
 * Reassign positions to people in the array.
 * 
 * If both best and average are equal to those of the previous person in the list, assigns the same position.
 * Otherwise, count previous people in the list and assign the value increased by 1.
 * @param result 
 */
function assignPositions(result: CubecompsResults[]) {
    result[0].position = 1;
    for (let i = 1; i < result.length; i++) {
        // If there is a tie, assign the same position.
        if (result[i].average === result[i - 1].average && result[i].best === result[i - 1].best) {
            result[i].position = result[i - 1].position;
        } else {
            result[i].position = i + 1;
        }
    }
    return result;
}

/**
 * Assign points.
 * 
 * If the result is DNF and it's round 1, assign 0 points.
 * To assign points, takes position points and multiplies them by a multiplicator. The value is rounded to the nearest integer.
 * 
 * @param result 
 * @param multiplicator 
 * @param round 
 */
function assignPoints(result: CubecompsResults[], multiplicator: number, round: number) {
    result.forEach((r) => {
        if (r.best === "DNF" && round === 1)
            r.points = 0;
        else if (r.position > config.game.at_points)
            r.points = 0;
        else r.points = Math.round(config.game.points[r.position] * multiplicator);
    });
    return result;
}

/**
 * Updates the number of imported round for a specific category.
 * 
 * @param category 
 */
async function incrementImports(category: string) {
    return getCustomRepository(CategoryRepository).incrementImports(category);
}

/**
 * Saves round results in the database.
 * 
 * @param result 
 * @param category 
 */
async function saveResults(result: CubecompsResults[], category: CategoryEntity) {
    let repo: ResultsRepository = getCustomRepository(ResultsRepository);
    for (let r of result) {
        let model: ResultsModel = r.toResult();
        await repo.insertResult(model, category);
    }
    return;
}

/**
 * Updates person points, it should be called after saving results.
 */
async function updatePersonPoints() {
    return getCustomRepository(PersonRepository).updateUserPoints();
}

/**
 * Updates team points. it should be called after updating person points.
 */
async function updateTeamPoints() {
    return;
}

export { router } 
