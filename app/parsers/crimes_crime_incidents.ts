import { Generator } from "../generator";
import { CrimesCrimeIncidents } from "../models";
import { IParser } from "./parser-interface";

export class CrimesCrimeIncidentsParser implements IParser {
  constructor(private sqlGenerator: Generator<CrimesCrimeIncidents>) {}

  public parse(row: string[]) {
    let crimeCount = 0;
    let crimeIncidentDrNo = row[0];

    for (let i = 20; i < 24; i++) {
      const crimeCode = parseInt(row[i], 10) || null;
      if (!crimeCode) {
        break;
      }
      crimeCount++;
      const crimesCrimeIncidents: CrimesCrimeIncidents = {
        CRIME_CODE: crimeCode,
        CRIME_INCIDENT_DR_NO: crimeIncidentDrNo,
        SEVERITY: crimeCount,
      };

      this.sqlGenerator.insert('CRIMES_CRIME_INCIDENTS', crimesCrimeIncidents);
    }
  }
}