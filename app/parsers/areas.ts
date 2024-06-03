import { Generator } from "../generator";
import { Areas } from "../models/areas";
import { IParser } from "./parser-interface";

export class AreasParser implements IParser {
  private processedData: Map<string, boolean> = new Map();

  constructor(private sqlGenerator: Generator<Areas>) {}

  public parse(row: string[]): void {
    const areaCode = row[4];
    const name = row[5];

    if (!this.processedData.has(areaCode) && areaCode) {
      const areas: Areas = {
        AREA_CODE: areaCode,
        NAME: name || null,
      };

      this.processedData.set(areaCode, true);
      this.sqlGenerator.insert('AREAS', areas);
    }
  }
}