import CsvReadableStream, * as csvReader from 'csv-reader';
import * as fs from 'fs';
import { Generator } from './app/generator';
import { ReportDistricts } from './app/models';
import { ReportDistrictsParser } from './app/parsers';
import { ReportDistrictsExportData } from './app/report-districts-export-data';

let inputStream = fs.createReadStream('test_data/report_dist_test.csv', 'utf8');

const alreadyGeneratedJSON = fs.readFileSync('processedLAPDReportDistrictsData.json', 'utf-8');
const alreadyProcessedData: ReportDistrictsExportData = JSON.parse(alreadyGeneratedJSON);

const csvReaderConfig = {
    trim: true,
}

let rowIdx = -1;

const reportDistrictsGenerator = new Generator<ReportDistricts>('report_districts.sql');
const reportDistrictsParser = new ReportDistrictsParser(reportDistrictsGenerator, alreadyProcessedData);

inputStream
    .pipe(new CsvReadableStream(csvReaderConfig))
    .on('data', function (row) {
        rowIdx++;
        if(rowIdx > 0){
          reportDistrictsParser.parse(row as string[])
        } else {
          (row as string[]).forEach((col, index) => {
            console.log(`[${index}]: ${col}`)
          });
        }
    })
    .on('end', function () {
        console.log('Reached the end of the file');
        reportDistrictsGenerator.onFileEnd();
    })