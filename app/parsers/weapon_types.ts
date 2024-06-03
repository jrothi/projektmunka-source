import { Generator } from "../generator";
import { WeaponTypes } from "../models/weapon_types";
import { IParser } from "./parser-interface";

export class WeaponTypesParser implements IParser {
  private processedData: Map<number, boolean> = new Map();

  constructor(private sqlGenerator: Generator<WeaponTypes>) {}

  public parse(row: string[]): void {
    const weaponCode = parseInt(row[16], 10);
    const description = row[17];

    if (!this.processedData.has(weaponCode) && weaponCode) {
      const weapons: WeaponTypes = {
        WEAPON_CODE: weaponCode,
        DESCRIPTION: description || null,
      };

      this.processedData.set(weaponCode, true);
      this.sqlGenerator.insert('WEAPON_TYPES', weapons);
    }
  }
}