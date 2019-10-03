import { ResultModel } from "../src/model/result";
import { assignPoints } from "../src/routes/controllers/result.api.controller";
import { EventModel } from "../src/model/event";


test("Test assign points", () => {
    let results: ResultModel[] = [];
    for (let i = 0; i < 25; i++) {
        let result: ResultModel = new ResultModel();
        result.best = 1;
        result.eventId = "333mbf";
        result.rank = i + 1;
    }
    let event: EventModel = new EventModel();
    event.eventId = "333mbf";

    let expected = [
        [225, 207, 190, 173, 158, 143, 128, 115, 102, 90, 79, 68, 59, 50, 41, 34, 25, 21, 16, 11, 8, 5, 2, 1, 0],
        [300, 276, 253, 231, 210, 190, 171, 153, 136, 120, 105, 91, 78, 66, 55, 45, 33, 28, 21, 15, 10, 6, 3, 1, 0],
        [375, 345, 316, 289, 263, 238, 214, 191, 170, 150, 131, 114, 98, 83, 69, 56, 41, 35, 26, 19, 13, 8, 4, 1, 0],
        [450, 414, 380, 347, 315, 285, 257, 230, 204, 180, 158, 137, 117, 99, 83, 68, 50, 42, 32, 23, 15, 9, 5, 2, 0],
        [600, 552, 506, 462, 420, 380, 342, 306, 272, 240, 210, 182, 156, 132, 110, 90, 66, 56, 42, 30, 20, 12, 6, 2, 0]
    ];
    let multiplicators = [0.75, 1, 1.25, 1., 2]
    for (let j = 0; j < 5; j++) {
        event.multiplicator = multiplicators[j];
        assignPoints(results, event, false);
        for (let i = 0; i < results.length; i++) {
            expect(results[i].points).toBe(expected[j][i]);
        }
    }
});