import * as fs from 'fs';
import * as readline from 'readline';
import { Generator } from './app/generator';
import { MoCodes } from './app/models';
import { MoCodesParser } from './app/parsers';

const moCodesFile = fs.createReadStream('test_data/mo_codes_test.txt', 'utf8');
const readLineInterface = readline.createInterface({
  input: moCodesFile,
  crlfDelay: Infinity
});

let isDescription = false;
let currentRow: string[] = [];

const moCodesGenerator = new Generator<MoCodes>('mo_codes.sql');
const moCodesParser = new MoCodesParser(moCodesGenerator);

readLineInterface
  .on('line', function (line) {
    const trimmedLine = (line as string).trim();
    if(!isDescription){
      currentRow = [trimmedLine];
      isDescription = true;
    } else {
      currentRow.push(trimmedLine);
      isDescription = false;
      moCodesParser.parse(currentRow);
    }
  })
  .on('close', function () {
    console.log('Reached the end of the file');
    moCodesGenerator.onFileEnd();
  })
