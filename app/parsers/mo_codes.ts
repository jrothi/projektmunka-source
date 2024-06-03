import { Generator } from "../generator";
import { MoCodes } from "../models/mo_codes";
import { IParser } from "./parser-interface";

export class MoCodesParser implements IParser {
  private processedData: Map<string, boolean> = new Map();

  constructor(private sqlGenerator: Generator<MoCodes>) {}

  public parse(row: string[]): void {
    const moCode = row[0];
    const description = row[1];

    if (!this.processedData.has(moCode)) {
      const moCodes: MoCodes = {
        MO_CODE: moCode,
        DESCRIPTION: description,
      };

      this.processedData.set(moCode, true);
      this.sqlGenerator.insert('MO_CODES', moCodes);
    }
  }
}