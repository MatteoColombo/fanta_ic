import { TeamModel } from "../src/model/team";
import { CuberModel } from "../src/model/cuber";
import { updateTeamsRank } from "../src/routes/controllers/result.api.controller";


test("test the function to compute team ranks", () => {
    const cubers = [
        { id: 1, name: "c1", points: 344, rank3: 2 },
        { id: 2, name: "c2", points: 345, rank3: 1 },
        { id: 3, name: "c3", points: 346, rank3: 3 },
        { id: 4, name: "c4", points: 343, rank3: 24 },
    ]
    let teams = [];
    let t1: TeamModel = createTeam(1, "t1", 689, 0);
    for (let i = 0; i < 2; i++) {
        t1.cubers.push(createCuber(cubers[i].id, cubers[i].name, cubers[i].points, cubers[i].rank3));
    }
    let t2: TeamModel = createTeam(2, "t2", 689, 0);
    for (let i = 2; i < 4; i++) {
        t2.cubers.push(createCuber(cubers[i].id, cubers[i].name, cubers[i].points, cubers[i].rank3));
    }

    teams = [t1, t2];
    updateTeamsRank(teams);
    expect(t1.rank).toBe(2);
    expect(t2.rank).toBe(1);
});



test("test the function to compute team ranks", () => {
    const cubers = [
        { id: 1, name: "c1", points: 345, rank3: 22 },
        { id: 2, name: "c2", points: 345, rank3: 11 },
        { id: 3, name: "c3", points: 345, rank3: 3 },
        { id: 4, name: "c4", points: 345, rank3: 24 },
    ]

    let teams = [];
    let t1: TeamModel = createTeam(1, "t1", 689, 0);
    for (let i = 0; i < 2; i++) {
        t1.cubers.push(createCuber(cubers[i].id, cubers[i].name, cubers[i].points, cubers[i].rank3));
    }
    let t2: TeamModel = createTeam(2, "t2", 689, 0);
    for (let i = 2; i < 4; i++) {
        t2.cubers.push(createCuber(cubers[i].id, cubers[i].name, cubers[i].points, cubers[i].rank3));
    }

    teams = [t1, t2];
    updateTeamsRank(teams);
    expect(t1.rank).toBe(2);
    expect(t2.rank).toBe(1);
});

test("test the function to compute team ranks", () => {
    const cubers = [
        { id: 1, name: "c1", points: 345, rank3: 24 },
        { id: 2, name: "c2", points: 345, rank3: 3 },
        { id: 3, name: "c3", points: 345, rank3: 3 },
        { id: 4, name: "c4", points: 345, rank3: 24 },
        { id: 5, name: "c5", points: 400, rank3: 1 },
        { id: 6, name: "c6", points: 400, rank3: 2 }
    ]

    let teams = [];
    let t1: TeamModel = createTeam(1, "t1", 689, 0);
    for (let i = 0; i < 2; i++) {
        t1.cubers.push(createCuber(cubers[i].id, cubers[i].name, cubers[i].points, cubers[i].rank3));
    }
    let t2: TeamModel = createTeam(2, "t2", 689, 0);
    for (let i = 2; i < 4; i++) {
        t2.cubers.push(createCuber(cubers[i].id, cubers[i].name, cubers[i].points, cubers[i].rank3));
    }
    let t3: TeamModel = createTeam(3, "t3", 800, 0);
    for (let i = 4; i < 6; i++) {
        t3.cubers.push(createCuber(cubers[i].id, cubers[i].name, cubers[i].points, cubers[i].rank3));
    }

    teams = [t3,t1, t2];
    updateTeamsRank(teams);
    expect(t1.rank).toBe(2);
    expect(t2.rank).toBe(2);
    expect(t3.rank).toBe(1);
});




function createCuber(id: number, name: string, points: number, rank3: number): CuberModel {
    let cuber: CuberModel = new CuberModel();
    cuber.id = id;
    cuber.name = name;
    cuber.points = points;
    cuber.rank3 = rank3;
    return cuber;
}

function createTeam(id: number, name: string, points: number, rank: number): TeamModel {
    let team: TeamModel = new TeamModel();
    team.id = id;
    team.name = name;
    team.points = points, team.rank = rank;
    team.cubers = [];
    return team;
}