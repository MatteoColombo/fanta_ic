import { AbstractRepository, EntityRepository } from "typeorm";
import { CuberModel } from "../../model/cuber";
import { CuberEntity } from "../entities/cuber.entity";
import { ICuber } from "../interfaces/i-cuber";

@EntityRepository(CuberEntity)
export class CuberRepository extends AbstractRepository<CuberEntity> implements ICuber {

    public async getCuberById(id: number): Promise<CuberModel> {
        const cuber: CuberEntity = await this.repository.findOne(id);
        return this.entityToModel(cuber);
    }

    public async getCuberByName(name: string): Promise<CuberModel> {
        const cuber: CuberEntity = await this.repository.findOne({ name });
        return this.entityToModel(cuber);
    }

    public async getCubers(sortByPrice: boolean): Promise<CuberModel[]> {
        let cubers: CuberEntity[];
        if (sortByPrice) {
            cubers = await this.repository.find({ order: { price: "DESC", name: "ASC" } });
        } else {
            cubers = await this.repository.find({ order: { points: "DESC", name: "ASC" } });
        }
        return cubers.map((c) => this.entityToModel(c));
    }

    public async updatePoints(cuber: number, points: number, rank3: number): Promise<CuberModel> {
        let entity: CuberEntity = await this.repository.findOne(cuber);
        entity.points = points;
        entity.rank3 = rank3;
        entity = await this.repository.save(entity);
        return this.entityToModel(entity);
    }

    public async updatePrice(cuber: number, price: number): Promise<CuberModel> {
        let entity: CuberEntity = await this.repository.findOne(cuber);
        entity.price = price;
        entity = await this.repository.save(entity);
        return this.entityToModel(entity);
    }

    public async addCuber(cuber: CuberModel): Promise<CuberModel> {
        let entity: CuberEntity = this.modelToEntity(cuber);
        entity = await this.repository.save(entity);
        return this.entityToModel(entity);
    }

    public async deleteCuber(cuber: CuberModel): Promise<void> {
        this.repository.delete(cuber.id);
    }

    public async cuberExists(id: number): Promise<boolean> {
        const count: number = await this.repository.count({ id });
        return count > 0;
    }

    public async cubersExist(ids: number[]): Promise<boolean> {
        for (const id of ids) {
            const exists: boolean = await this.cuberExists(id);
            if (!exists) { return false; }
        }
        return true;
    }

    public async getCubersPrice(ids: number[]): Promise<number> {
        let sum = 0;
        for (const id of ids) {
            const cuber: CuberEntity = await this.repository.findOne(id);
            sum += cuber.price;
        }
        return sum;
    }

    public initDefaults(): void {
        throw new Error("Method not implemented.");
    }

    private entityToModel(origin: CuberEntity): CuberModel {
        if (origin) {
            return origin._transform();
        } else { return null; }
    }

    private modelToEntity(origin: CuberModel): CuberEntity {
        const entity: CuberEntity = new CuberEntity();
        entity._assimilate(origin);
        return entity;
    }

}
