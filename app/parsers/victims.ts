import { Generator } from "../generator";
import { Victims } from "../models/victims";
import { IParser } from "./parser-interface";

export class VictimsParser implements IParser {
  private victimIdCounter = 1;

  constructor(private sqlGenerator: Generator<Victims>) {}

  public parse(row: string[]): number | null {
    let age = parseInt(row[11], 10) || null;
    let sex = row[12].trim() || 'X';
    let descentCode = row[13].trim() || 'X';

    if (age && age <= 0) {
      age = null;
    }

    if (sex === '-'){
      sex = 'X';
    }
    
    if (descentCode === '-'){
      descentCode = 'X';
    }

    if (age === null && sex === 'X' && descentCode === 'X') {
      return null;
    }

    const victim: Victims = {
      VICTIM_ID: this.victimIdCounter++,
      AGE: age,
      SEX: sex,
      DESCENT_CODE: descentCode,
    };

    this.sqlGenerator.insert('VICTIMS', victim);
    return victim.VICTIM_ID;
  }
}