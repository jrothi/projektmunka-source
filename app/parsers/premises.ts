import { Generator } from "../generator";
import { Premises } from "../models/premises";
import { IParser } from "./parser-interface";

export class PremisesParser implements IParser {
  private processedData: Map<number, boolean> = new Map();

  constructor(private sqlGenerator: Generator<Premises>) {}

  public parse(row: string[]): void {
    const premiseCode = parseInt(row[14], 10);
    const description = row[15];

    if (!this.processedData.has(premiseCode) && premiseCode) {
      const premises: Premises = {
        PREMISE_CODE: premiseCode,
        DESCRIPTION: description || null,
      };

      this.processedData.set(premiseCode, true);
      this.sqlGenerator.insert("PREMISES", premises);
    }
  }
}
