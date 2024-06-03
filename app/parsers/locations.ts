import { Generator } from "../generator";
import { Locations } from "../models";
import { IParser } from "./parser-interface";

export class LocationsParser implements IParser {
  private locationIdCounter = 1;
  private processedData: Map<string, number> = new Map();

  constructor(private sqlGenerator: Generator<Locations>) {}

  public parse(row: string[]): number | null {
    const locationName = row[24].replace(/\s+/g, ' ').trim() || null;

    if (locationName && !this.processedData.has(locationName)) {
      const location: Locations = {
        LOCATION_ID: this.locationIdCounter++,
        NAME: locationName,
      };
  
      this.processedData.set(locationName, location.LOCATION_ID!);
      this.sqlGenerator.insert('LOCATIONS', location);
    }

    return locationName ? this.processedData.get(locationName)! : null;
  }
}
