import { IRepo } from "./i-repo";
import { CuberModel } from "../../model/cuber";

export interface ICuber extends IRepo {

    getCuberById(id: number): Promise<CuberModel>;
    getCuberByName(name: string): Promise<CuberModel>;

    getCubers(sortByPrice: boolean): Promise<CuberModel[]>;

    updatePoints(cuber: number, points: number, rank3: number): Promise<CuberModel>;
    updatePrice(cuber: number, price: number): Promise<CuberModel>;

    addCuber(cuber: CuberModel): Promise<CuberModel>;
    deleteCuber(cuber: CuberModel): Promise<void>;

    cuberExists(id: number): Promise<boolean>;
    cubersExist(ids: number[]): Promise<boolean>;

    getCubersPrice(ids: number[]): Promise<number>;

}