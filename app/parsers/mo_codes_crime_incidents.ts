import { Generator } from "../generator";
import { MoCodesCrimeIncidents } from "../models";
import { IParser } from "./parser-interface";

export class MoCodesCrimeIncidentsParser implements IParser {
  constructor(private sqlGenerator: Generator<MoCodesCrimeIncidents>) {}

  public parse(row: string[]) {
    const moCodes = row[10] ? row[10].trim().split(' ') : null;
    const crimeIncidentDrNo = row[0];

    if (!moCodes) {
      return;
    }

    for (const moCode of moCodes) {
      const moCodesCrimeIncidents: MoCodesCrimeIncidents = {
        MO_CODE: moCode,
        CRIME_INCIDENT_DR_NO: crimeIncidentDrNo,
      };

      this.sqlGenerator.insert('MO_CODES_CRIME_INCIDENTS', moCodesCrimeIncidents);
    }
  }
}