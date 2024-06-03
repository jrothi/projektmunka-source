import CsvReadableStream, * as csvReader from "csv-reader";
import * as fs from "fs";
import { Generator } from "./app/generator";
import {
  Areas,
  Premises,
  Victims,
  WeaponTypes,
  Crimes,
  ReportDistrictsPartial,
  Locations,
  CrimeIncidents,
  CrimesCrimeIncidents,
  MoCodesCrimeIncidents,
  LocationsReportDistricts,
} from "./app/models";
import {
  AreasParser,
  PremisesParser,
  VictimsParser,
  WeaponTypesParser,
  CrimesParser,
  ReportDistrictsPartialParser,
  LocationsParser,
  LocationsReportDistrictsCreator,
  CrimeIncidentsParser,
  CrimesCrimeIncidentsParser,
  MoCodesCrimeIncidentsParser
} from "./app/parsers";
import * as cliProgress from "ts-progress";

let inputStream = fs.createReadStream("test_data/crime_data_test.csv", "utf8");

const csvReaderConfig = {
  trim: true,
};

const ciErrorHandlingConfig = {
  enabled: true,
  errorLogTableName: 'CI_ERR_LOG',
};

const c_ciErrorHandlingConfig = {
  enabled : true,
  errorLogTableName: 'C_CI_ERR_LOG',
}

const mo_ciErrorHandlingConfig = {
  enabled : true,
  errorLogTableName: 'MO_CI_ERR_LOG',
}

const loc_rdErrorHandlingConfig = {
  enabled : true,
  errorLogTableName: 'LOC_RD_ERR_LOG',
}

const premisesGenerator = new Generator<Premises>('premises.sql');
const weaponTypesGenerator = new Generator<WeaponTypes>('weapon_types.sql');
const areasGenerator = new Generator<Areas>('areas.sql');
const victimsGenerator = new Generator<Victims>('victims.sql');
const crimesGenerator = new Generator<Crimes>('crimes.sql');
const reportDistrictsPartialGenerator = new Generator<ReportDistrictsPartial>('report_districts.sql');
const locationsGenerator = new Generator<Locations>('locations.sql');
const crimeIncidentsGenerator = new Generator<CrimeIncidents>('crime_incidents.sql', ciErrorHandlingConfig);
const crimesCrimeIncidentsGenerator = new Generator<CrimesCrimeIncidents>('crimes_crime_incidents.sql')//, c_ciErrorHandlingConfig);
const moCodesCrimeIncidentsGenerator = new Generator<MoCodesCrimeIncidents>('mo_codes_crime_incidents.sql', mo_ciErrorHandlingConfig);
const locationsReportDistrictsGenerator = new Generator<LocationsReportDistricts>('locations_report_districts.sql', loc_rdErrorHandlingConfig);

const premisesParser = new PremisesParser(premisesGenerator);
const weaponTypesParser = new WeaponTypesParser(weaponTypesGenerator);
const areasParser = new AreasParser(areasGenerator);
const victimsParser = new VictimsParser(victimsGenerator);
const crimesParser = new CrimesParser(crimesGenerator);
const reportDistrictsPartialParser = new ReportDistrictsPartialParser(reportDistrictsPartialGenerator);
const locationsParser = new LocationsParser(locationsGenerator);
const crimeIncidentsParser = new CrimeIncidentsParser(crimeIncidentsGenerator, victimsParser);
const crimesCrimeIncidentsParser = new CrimesCrimeIncidentsParser(crimesCrimeIncidentsGenerator);
const moCodesCrimeIncidentsParser = new MoCodesCrimeIncidentsParser(moCodesCrimeIncidentsGenerator);
const locationsReportDistrictsCreator = new LocationsReportDistrictsCreator(locationsReportDistrictsGenerator);

const bar = cliProgress.create({total: 938458});

let rowIdx = -1;

inputStream
  .pipe(new CsvReadableStream(csvReaderConfig))
  .on("data", function (row) {
    bar.update();
    rowIdx++;
    if (rowIdx > 0) {
      premisesParser.parse(row as string[]);
      weaponTypesParser.parse(row as string[]);
      areasParser.parse(row as string[]);
      crimesParser.parse(row as string[]);
      const location_id = locationsParser.parse(row as string[]);
      crimeIncidentsParser.parse(row as string[], location_id);
      crimesCrimeIncidentsParser.parse(row as string[]);
      moCodesCrimeIncidentsParser.parse(row as string[]);
      const reportDistrictId = reportDistrictsPartialParser.parse(row as string[]);

      if (location_id && reportDistrictId) {
        locationsReportDistrictsCreator.createRelationship(location_id, reportDistrictId);
      }
    } else {
      (row as string[]).forEach((col, index) => {
        console.log(`[${index}]: ${col}`);
      });
    }
  })
  .on("end", function () {
    console.log("Reached the end of the file");
    premisesGenerator.onFileEnd();
    weaponTypesGenerator.onFileEnd();
    areasGenerator.onFileEnd();
    victimsGenerator.onFileEnd();
    crimesParser.onFileEnd();
    crimesGenerator.onFileEnd();
    reportDistrictsPartialGenerator.onFileEnd();
    reportDistrictsPartialParser.onFileEnd();
    locationsGenerator.onFileEnd();
    crimeIncidentsGenerator.onFileEnd();
    crimesCrimeIncidentsGenerator.onFileEnd();
    moCodesCrimeIncidentsGenerator.onFileEnd();
    locationsReportDistrictsGenerator.onFileEnd();
  });
