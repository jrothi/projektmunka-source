import { Generator } from "../generator";
import { Crimes } from "../models/crimes";
import { IParser } from "./parser-interface";

export class CrimesParser implements IParser {
  private processedData: Map<number, boolean> = new Map();
  private crimesPotentiallyMissingDescription: Map<number, boolean> = new Map();

  constructor(private sqlGenerator: Generator<Crimes>) {}

  public parse(row: string[]): void {
    const part = parseInt(row[7]);
    const crimeCode = parseInt(row[8]);
    const description = row[9] || null;

    const crimesPotentiallyMissingDescriptionCodes = [
      parseInt(row[21]),
      parseInt(row[22]),
      parseInt(row[23]),
    ].filter((code) => code && !isNaN(code));

    crimesPotentiallyMissingDescriptionCodes.forEach((code) => {
      if (!this.crimesPotentiallyMissingDescription.has(code) && !this.processedData.has(code)) {
        this.crimesPotentiallyMissingDescription.set(code, true);
      }
    });

    if (this.crimesPotentiallyMissingDescription.has(crimeCode)) {
      this.crimesPotentiallyMissingDescription.set(crimeCode, false);
    }

    if (!this.processedData.has(crimeCode)) {
      const crime: Crimes = {
        CRIME_CODE: crimeCode,
        DESCRIPTION: description,
        PART: part,
      };

      this.processedData.set(crimeCode, true);
      this.sqlGenerator.insert('CRIMES', crime);
    }
  }

  public onFileEnd(): void {
    for (const [crimeCode, missingDescription] of this.crimesPotentiallyMissingDescription.entries()) {
      if (missingDescription) {
        const crime: Crimes = {
          CRIME_CODE: crimeCode,
          DESCRIPTION: null,
          PART: 2,
        };

        this.sqlGenerator.insert('CRIMES', crime);
      }
    }
  }
}