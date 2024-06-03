export interface IParser {
  parse(row: string[] | string, foreign_key?: number | string | null): void;
}