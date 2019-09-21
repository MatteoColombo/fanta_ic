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
import { TeamRepository } from "../../database/repos/team.repository";
import { TeamEntity } from "../../database/entities/team.entity";

const router: Router = Router();

router.get("/categories/importable", async (req, res) => {
    let categories: CategoryEntity[] = await getCustomRepository(CategoryRepository).getImportableRounds();
    res.status(200).json(categories.map((c) => c._transform()));
});

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
        await updateTeamPoints();
        await setTeamPosition();
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
    return result.filter((r: CubecompsResults) => r.country === config.game.country).sort((a, b) => (a.position - b.position));
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
    return getCustomRepository(TeamRepository).computeTeamPoints();
}

async function setTeamPosition() {
    let repo: TeamRepository = getCustomRepository(TeamRepository);
    // Get all the teams
    let teams: TeamEntity[] = await repo.getTeams(true);
    // Assign position 1 to the first of the list
    teams[0].position = 1;
    // Array containing positions where there is a tie
    let dups: number[] = [];

    // Assign positions, if points are the same as the previous cuber, assign the same position
    for (let i = 1; i < teams.length; i++) {
        if (teams[i].points === teams[i - 1].points) {
            teams[i].position = teams[i - 1].position;
            if (dups.indexOf(teams[i].position) < 0) dups.push(teams[i].position);
        }
        else
            teams[i].position = i + 1;
    }

    // If there are ties, enter 
    if (dups.length > 0) {

        // For each position that has a tie, do something
        for (let position of dups) {
            // Get the teams that are tied at position "position"
            let tiedTeams: TeamEntity[] = teams.filter((t) => t.position === position);
            let tiedAgain: Set<number> = new Set<number>([]);

            // Sort them
            tiedTeams.sort((a, b) => {
                // Get the points of the team cubers, ordered desc.
                let aPoints: number[] = a.cubers.map((c) => c.points).sort((p1, p2) => p1 - p2);
                let bPoints: number[] = b.cubers.map((c) => c.points).sort((p1, p2) => p1 - p2);
                // Iterate over the points to sort
                for (let i = 0; i < aPoints.length; i++) {
                    if (aPoints[i] > bPoints[i]) return 1;
                    else if (aPoints[i] < bPoints[i]) return -1;
                }
                // If we got here it means that's a tie. We return 0 and we add the teams to the set of those which are still tied.
                tiedAgain.add(a.id);
                tiedAgain.add(b.id);
                return 0;
            });

            // Assign positions to those that are not tied anymore
            for (let i = 0; i < tiedTeams.length; i++) {
                // If the person is in the list of those who are still tied, break the cycle
                if (tiedAgain.has(tiedTeams[i].id)) break;
                tiedTeams[i].position = position + i;
            }

            // Assign position to those that are still tied
            if (tiedAgain.size > 0) {
                let pInc: number = tiedTeams.length - tiedAgain.size;
                tiedTeams.forEach(t => {
                    if (tiedAgain.has(t.id)) {
                        t.position = position + pInc;
                    }
                });
            }
            //Update positions in the teams list
            tiedTeams.forEach((t) => teams.find((t2) => t2.id === t.id).position = t.position);
        }
    }
    // Save the teams with updated positions
    return repo.savePositions(teams);
}

export { router } 
