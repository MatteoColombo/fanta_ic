import { BaseEntity, Connection, createConnection, getCustomRepository } from "typeorm";
import { BaseCommonRepository } from "./BaseCommonRepository";
import { Bootstrap } from "./bootstrap";

export class Database {

    public connection: Connection;
    private isConnected: boolean = false;

    public async createConnection(): Promise<void> {
        this.connection = await createConnection();
        this.isConnected = true;
    }

    public async closeConnection() {
        this.connection.close();
        this.isConnected = false;
    }

    public async initDatabase(): Promise<void> {
        const repos: Array<BaseCommonRepository<BaseEntity>> = Bootstrap();
        for (const repo of repos) {
            await repo.InitDefaults();
        }

        return;
    }

}
