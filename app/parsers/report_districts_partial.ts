import { Generator } from "../generator";
import { ReportDistrictsPartial } from "../models/report_districts_partial";
import { ReportDistrictsExportData } from "../report-districts-export-data";
import { IParser } from "./parser-interface";
import fs from 'fs';

export class ReportDistrictsPartialParser implements IParser {
  private reportDistrictIdCounter = 1;
  private processedData: Map<string, number> = new Map();

  constructor(private sqlGenerator: Generator<ReportDistrictsPartial>) {}

  public parse(row: string[]): number {
    const areaCode = row[4];
    const reportDistrictCode = row[6];

    if (!this.processedData.has(reportDistrictCode)) {
      const reportDistrict: ReportDistrictsPartial = {
        REPORT_DISTRICT_ID: this.reportDistrictIdCounter++,
        REPORT_DISTRICT_CODE: reportDistrictCode,
        AREA_CODE: areaCode,
      };
  
      this.processedData.set(reportDistrictCode, reportDistrict.REPORT_DISTRICT_ID);
      this.sqlGenerator.insert('REPORT_DISTRICTS', reportDistrict);
    }

    return this.processedData.get(reportDistrictCode!)!;
  }

  public onFileEnd(): void {
    const processedData = Object.fromEntries(this.processedData);
    const exportData: ReportDistrictsExportData = {
      processedData: processedData,
      first_free_id: this.reportDistrictIdCounter,
    }
    const jsonString = JSON.stringify(exportData);
    fs.writeFileSync('processedLAPDReportDistrictsData.json', jsonString);
  }
}
