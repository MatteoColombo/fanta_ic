import { UserModel } from "../../model/user";
import { IRepo } from "./i-repo";

export interface IUser extends IRepo {

    getUserById(id: number): Promise<UserModel>;
    saveUser(user: UserModel): Promise<UserModel>;

}