import { Generator } from "../generator";
import { LocationsReportDistricts } from "../models";

export class LocationsReportDistrictsCreator {
  constructor(private sqlGenerator: Generator<LocationsReportDistricts>) {}

  // <location_id, Set<report_district_id>>
  private processedData: Map<number, Set<number>> = new Map();

  public createRelationship(location_id: number, report_district_id: number) {
    const locationsReportDistricts: LocationsReportDistricts = {
      LOCATION_ID: location_id,
      REPORT_DISTRICT_ID: report_district_id,
    };

    if (!this.processedData.has(location_id)) {
      this.processedData.set(location_id, new Set());
    }

    const reportDistricts = this.processedData.get(location_id);
    if (reportDistricts && !reportDistricts.has(report_district_id)) {
      reportDistricts.add(report_district_id);
      this.sqlGenerator.insert('LOCATIONS_REPORT_DISTRICTS', locationsReportDistricts);
    }
  }
}