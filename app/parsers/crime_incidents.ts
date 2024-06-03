import { Generator } from "../generator";
import { CrimeIncidents } from "../models";
import { IParser } from "./parser-interface";
import { VictimsParser } from "./victims";

export class CrimeIncidentsParser implements IParser {

  constructor(private sqlGenerator: Generator<CrimeIncidents>,
    private vParser: VictimsParser,
  ) {}

  public parse(row: string[], location_id: number | null) {
    const dr_no = row[0];
    const date_reported = this.generateDateReported(row[1]);
    const date_occurred = this.generateCombinedDateOccurred(row[2], row[3]);
    const crime_status_code = row[18];
    const weapon_type_code = parseInt(row[16], 10) || null;
    const premise_code = parseInt(row[14], 10) || null;
    const victim_id = this.vParser.parse(row);
    const latitude = (row[26] && row[26] !== '0') ? parseFloat(row[26]) : null;
    const longitude = (row[27] && row[27] !== '0') ? parseFloat(row[27]) : null;

    const crimeIncident: CrimeIncidents = {
      DR_NO: dr_no,
      DATE_REPORTED: date_reported,
      DATE_OCCURRED: date_occurred,
      CRIME_STATUS_CODE: crime_status_code,
      WEAPON_TYPE_CODE: weapon_type_code,
      PREMISE_CODE: premise_code,
      VICTIM_ID: victim_id,
      LOCATION_ID: location_id,
      LATITUDE: latitude,
      LONGITUDE: longitude,
    };
    
    this.sqlGenerator.insert('CRIME_INCIDENTS', crimeIncident);
  }

  private generateCombinedDateOccurred(dateOccurred: string, timeOccurred: string): Date {
    const [date, other] = dateOccurred.split(' ');
    const [month, day, year] = date.split('/');
    const formattedDate = `${year}-${month}-${day}T${timeOccurred.slice(0, 2)}:${timeOccurred.slice(2)}:00`;
    return new Date(formattedDate + 'Z');
  }

  private generateDateReported(dateReported: string): Date {
    const [date, time, other] = dateReported.split(' ');
    const [month, day, year] = date.split('/');
    const formattedDate = `${year}-${month}-${day}T${time}`;
    return new Date(formattedDate + 'Z');
  }
}