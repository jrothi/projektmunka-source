import { Generator } from "../generator";
import { ReportDistricts } from "../models/report_districts";
import { ReportDistrictsExportData } from "../report-districts-export-data";
import { IParser } from "./parser-interface";

export class ReportDistrictsParser implements IParser {
  private reportDistrictIdCounter: number
  private alreadyProcessedLAPDRDs: Map<string, number>;

  constructor(
    private sqlGenerator: Generator<ReportDistricts>,
    importedData: ReportDistrictsExportData,
  ) {
    this.reportDistrictIdCounter = importedData.first_free_id;
    this.alreadyProcessedLAPDRDs = new Map(Object.entries(importedData.processedData));
  }


  public parse(row: string[]): void {
    const reportDistrictCode = row[1] || null;
    const serviceType = row[2] || null;
    const communityType = row[3] || null;
    const name = row[4] || null;
    const stationName = row[5] || null;
    const omegaLabel = row[6] || null;
    const label = row[7] || null;
    const agency = row[8] || null;
    const station = row[9] || null;
    const omegaName = row[10] || null;
    const shapeLength = parseFloat(row[11]) || null;
    const shapeArea = parseFloat(row[12]) || null;

    const reportDistrict: ReportDistricts = {
      REPORT_DISTRICT_CODE: reportDistrictCode,
      SERVICE_TYPE: serviceType,
      COMMUNITY_TYPE: communityType,
      NAME: name,
      LABEL: label,
      AGENCY: agency,
      STATION_NAME: stationName,
      STATION: station,
      OMEGA_LABEL: omegaLabel,
      OMEGA_NAME: omegaName,
      SHAPE_LENGTH: shapeLength,
      SHAPE_AREA: shapeArea,
    };

    if (!reportDistrictCode || !this.alreadyProcessedLAPDRDs.has(reportDistrictCode)) {
      reportDistrict.REPORT_DISTRICT_ID = this.reportDistrictIdCounter++;
      this.sqlGenerator.insert('REPORT_DISTRICTS', reportDistrict);
    } else if (reportDistrictCode && !this.alreadyProcessedLAPDRDs.has(reportDistrictCode)) {
      reportDistrict.REPORT_DISTRICT_ID = this.reportDistrictIdCounter++;
      this.sqlGenerator.insert('REPORT_DISTRICTS', reportDistrict);
    } else if (reportDistrictCode && this.alreadyProcessedLAPDRDs.has(reportDistrictCode)) {
      if (reportDistrict.AGENCY === 'LAPD') {
        const reportDistrictId = this.alreadyProcessedLAPDRDs.get(reportDistrictCode)!;
        this.sqlGenerator.update('REPORT_DISTRICTS', 'REPORT_DISTRICT_ID', reportDistrictId, reportDistrict);
      } else {
        reportDistrict.REPORT_DISTRICT_ID = this.reportDistrictIdCounter++;
        this.sqlGenerator.insert('REPORT_DISTRICTS', reportDistrict);
      }
    }
  }
}