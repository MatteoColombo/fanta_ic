import { IRepo } from "./i-repo";
import { ResultModel } from "../../model/result";

export interface IResult extends IRepo {

    insertResult(origin: ResultModel, event: string, user: number): Promise<ResultModel>;
    getResultsByPerson(id: number): Promise<ResultModel[]>;
    deleteResults(): Promise<void>;

}