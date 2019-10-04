import { ResultModel } from "../../model/result";
import { IRepo } from "./i-repo";

export interface IResult extends IRepo {

    insertResult(origin: ResultModel, event: string, user: number): Promise<ResultModel>;
    getResultsByPerson(id: number): Promise<ResultModel[]>;
    deleteResults(): Promise<void>;

}
