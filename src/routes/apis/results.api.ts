import { Deserialize } from "cerialize";
import { Router } from "express";
import request from "request-promise";
import { getCustomRepository } from "typeorm";
import { config } from "../../secrets/config";
import { isOrganizer } from "../middlewares/auth.middleware";
import { checkEvent, checkRound } from "../middlewares/results.middleware";

const router: Router = Router();
/*
router.get("/categories/importable", async (req, res) => {
    const categories: CategoryEntity[] = await getCustomRepository(CategoryRepository).getImportableRounds();
    res.status(200).json(categories.map((c) => c._transform()));
});

router.get("/import/events/:event/rounds/:round", isOrganizer,checkEvent, checkRound, async (req, res) => {
    try {
        const categoryRepo: CategoryRepository = getCustomRepository(CategoryRepository);
        const category: CategoryEntity = await categoryRepo.getCategoryById(req.params.event);
        const compId = "TassinlaDemiCubeOpen2019"//config.cubecomps.competition_id;
        let json = await getWCALiveJSON(compId, req.params.event, req.params.round);
        res.json(json);
        let result: CubecompsResults[] = json.data.round.results.map((r) => Deserialize(r, CubecompsResults));
        // Filter, assign positions and points.
        result = filterAndSort(result);
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
        res.status(400).json({ error: "BAD_REQUEST" });
    }
});


async function getCubecompsJSON(url: string) {
    return request({
        json: true,
        method: "GET",
        uri: url
    });
}

async function getWCALiveJSON(compId, eventId, roundNumber) {
    return request({
        json: true,
        method: "POST",
        uri: "https://live.worldcubeassociation.org/api",
        body: {
            "operationName": "Round",
            "variables": { "competitionId": compId, "roundId": `${eventId}-r${roundNumber}` },
            "query": "query Round($competitionId: ID!, $roundId: ID!) {\nround(competitionId: $competitionId, roundId: $roundId) {\n id\n name\n results {\n ranking\n best\n average\n person {\n wcaId\n name\n country {\n name\n}\n}\n}\n}\n}\n"
        }
    });
}

function filterAndSort(result: CubecompsResults[]) {
    return result.filter((r: CubecompsResults) => r.country === config.game.country).sort((a, b) => (a.position - b.position));
}


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


function assignPoints(result: CubecompsResults[], multiplicator: number, round: number) {
    result.forEach((r) => {
        if (r.best === "DNF" && round === 1) {
            r.points = 0;
        } else if (r.position > config.game.at_points) {
            r.points = 0;
        } else { r.points = Math.round(config.game.points[r.position] * multiplicator); }
    });
    return result;
}


async function incrementImports(category: string) {
    return getCustomRepository(CategoryRepository).incrementImports(category);
}


async function saveResults(result: CubecompsResults[], category: CategoryEntity) {
    const repo: ResultsRepository = getCustomRepository(ResultsRepository);
    for (const r of result) {
        const model: ResultsModel = r.toResult();
        await repo.insertResult(model, category);
    }
    return;
}

async function updatePersonPoints() {
    return getCustomRepository(PersonRepository).updateUserPoints();
}


async function updateTeamPoints() {
    return getCustomRepository(TeamRepository).computeTeamPoints();
}

async function setTeamPosition() {
    const repo: TeamRepository = getCustomRepository(TeamRepository);
    // Get all the teams
    const teams: TeamEntity[] = await repo.getTeams(true);
    // Assign position 1 to the first of the list
    teams[0].position = 1;
    // Array containing positions where there is a tie
    const dups: number[] = [];

    // Assign positions, if points are the same as the previous cuber, assign the same position
    for (let i = 1; i < teams.length; i++) {
        if (teams[i].points === teams[i - 1].points) {
            teams[i].position = teams[i - 1].position;
            if (dups.indexOf(teams[i].position) < 0) { dups.push(teams[i].position); }
        } else {
            teams[i].position = i + 1;
        }
    }

    // If there are ties, enter
    if (dups.length > 0) {

        // For each position that has a tie, do something
        for (const position of dups) {
            // Get the teams that are tied at position "position"
            const tiedTeams: TeamEntity[] = teams.filter((t) => t.position === position);
            const tiedAgain: Set<number> = new Set<number>([]);

            // Sort them
            tiedTeams.sort((a, b) => {
                // Get the points of the team cubers, ordered desc.
                const aPoints: number[] = a.cubers.map((c) => c.points).sort((p1, p2) => p1 - p2);
                const bPoints: number[] = b.cubers.map((c) => c.points).sort((p1, p2) => p1 - p2);
                // Iterate over the points to sort
                for (let i = 0; i < aPoints.length; i++) {
                    if (aPoints[i] > bPoints[i]) { return 1; } else if (aPoints[i] < bPoints[i]) { return -1; }
                }
                // If we got here it means that's a tie.
                // We return 0 and we add the teams to the set of those which are still tied.
                tiedAgain.add(a.id);
                tiedAgain.add(b.id);
                return 0;
            });

            // Assign positions to those that are not tied anymore
            for (let i = 0; i < tiedTeams.length; i++) {
                // If the person is in the list of those who are still tied, break the cycle
                if (tiedAgain.has(tiedTeams[i].id)) { break; }
                tiedTeams[i].position = position + i;
            }

            // Assign position to those that are still tied
            if (tiedAgain.size > 0) {
                const pInc: number = tiedTeams.length - tiedAgain.size;
                tiedTeams.forEach((t) => {
                    if (tiedAgain.has(t.id)) {
                        t.position = position + pInc;
                    }
                });
            }
            // Update positions in the teams list
            tiedTeams.forEach((t) => teams.find((t2) => t2.id === t.id).position = t.position);
        }
    }
    // Save the teams with updated positions
    return repo.savePositions(teams);
}
*/
export { router };
