import { Connection, createConnection, } from "typeorm";
import { IRepo } from "./interfaces/i-repo";
import { RepoManager } from "./repo-manager";
import { EventRepository } from "./repos/event.repository";

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
        const repo: EventRepository = RepoManager.getEventRepo();
        await repo.initDefaults();
        return;
    }

}
