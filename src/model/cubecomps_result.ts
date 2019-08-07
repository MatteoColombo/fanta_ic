import { autoserialize } from "cerialize";

class CubecompsResults {

    @autoserialize
    competitor_id: number;

    @autoserialize
    name: string;

    @autoserialize
    position: number;

    @autoserialize
    country: string;

    @autoserialize
    average: string;

    @autoserialize
    best: string;
}