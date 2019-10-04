import { AbstractRepository, EntityRepository, MoreThanOrEqual } from "typeorm";
import { ResultModel } from "../../model/result";
import { CuberEntity } from "../entities/cuber.entity";
import { EventEntity } from "../entities/event.entity";
import { ResultEntity } from "../entities/result.entity";
import { IResult } from "../interfaces/i-result";

@EntityRepository(ResultEntity)
export class ResultRepository extends AbstractRepository<ResultEntity> implements IResult {

    public async insertResult(origin: ResultModel, event: string, user: number): Promise<ResultModel> {
        let entity: ResultEntity = new ResultEntity();
        entity._assimilate(origin);
        entity.event = new EventEntity();
        entity.event.eventId = event;
        entity.cuber = new CuberEntity();
        entity.cuber.id = user;
        entity = await this.repository.save(entity);
        return entity._transform();
    }

    public async getResultsByPerson(id: number): Promise<ResultModel[]> {
        const results: ResultEntity[] = await this.repository.createQueryBuilder()
            .select("result").from(ResultEntity, "result")
            .innerJoinAndSelect("result.cuber", "cuber")
            .innerJoinAndSelect("result.event", "event")
            .where("cuber.id = :id", { id }).getMany();
        return results.map((r) => r._transform());
    }

    public async deleteResults(): Promise<void> {
        this.repository.delete({ points: MoreThanOrEqual(0) });
    }

    public initDefaults(): void {
        return;
    }

}
