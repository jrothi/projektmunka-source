import * as fs from 'fs';
import * as path from 'path';
import { ErrorHandlingConfig } from './error-handling-config';

export class Generator<T> {
  batchSize = 1000;
  batchCount = 0;
  batchSqlStatement: string[] = [];

  constructor(private filename: string, private errorHandlingConfig: ErrorHandlingConfig = { enabled: false }) {}

  public insert(table_name: string, data: T): void {
    let sqlStatement = this.generateSQLInsertStatement(table_name, data);

    if(this.errorHandlingConfig.enabled) {
      sqlStatement = this.appendErrorHandling(
        sqlStatement,
        this.errorHandlingConfig.errorLogTableName!,
        'INSERT'
      );
    }

    this.batchSqlStatement.push(sqlStatement);

    if (++this.batchCount === this.batchSize) {
      this.writeCurrentBatch();
    }
  }

  public update(table_name: string, pkey_name: string, pkey_value: number, data: T): void {
    let sqlStatement = this.generateSQLUpdateStatement(table_name, pkey_name, pkey_value, data);

    if(this.errorHandlingConfig.enabled) {
      sqlStatement = this.appendErrorHandling(
        sqlStatement,
        this.errorHandlingConfig.errorLogTableName!,
        'UPDATE'
      );
    }

    this.batchSqlStatement.push(sqlStatement);

    if (++this.batchCount === this.batchSize) {
      this.writeCurrentBatch();
    }
  }

  public onFileEnd(): void {
    if (this.batchCount > 0) {
      this.writeCurrentBatch();
    }
  }

  private generateSQLInsertStatement(table_name: string, data: T): string {
    let insertStatement = `INSERT INTO ${table_name.toUpperCase()} (`;
    for (const key in data) {
      insertStatement += `${key}, `;
    }
    insertStatement = insertStatement.slice(0, -2);
    insertStatement += ") VALUES (";

    for (const key in data) {
      if (!data[key]) {
        insertStatement += "NULL, ";
        continue;
      }

      if(data[key] instanceof Date) {
        const isoString = (data[key] as Date).toISOString();
        const [datePart, timePart] = isoString.split('T');
        const [year, month, day] = datePart.split('-');
        const [hour, minute, second] = timePart.split(':');
        const dateString = `${year}/${month}/${day} ${hour}:${minute}:${second.slice(0, 2)}`;
        const dateFormat = 'yyyy/mm/dd hh24:mi:ss';

        insertStatement += `TO_DATE('${dateString}', '${dateFormat}'), `;
        continue;
      }

      switch (typeof data[key]) {
        case "string":
          let value = data[key] as string;
          insertStatement += `q'[${value}]', `;
          break;
        case "number":
          insertStatement += `${data[key]}, `;
      }
    }

    insertStatement = insertStatement.slice(0, -2);
    insertStatement += ");";
    return insertStatement;
  }

  private generateSQLUpdateStatement(table_name: string, pk_name: string, pk_val: number, data: T): string {
    let updateStatement = `UPDATE ${table_name.toUpperCase()} SET `;

    for (const key in data) {
      if (key === pk_name) {
        continue;
      }

      if (!data[key]) {
        updateStatement += `${key} = NULL, `;
        continue;
      }

      if(data[key] instanceof Date) {
        const isoString = (data[key] as Date).toISOString();
        const [datePart, timePart] = isoString.split('T');
        const [year, month, day] = datePart.split('-');
        const [hour, minute, second] = timePart.split(':');
        const dateString = `${year}/${month}/${day} ${hour}:${minute}:${second.slice(0, 2)}`;
        const dateFormat = 'yyyy/mm/dd hh24:mi:ss';

        updateStatement += `${key}=TO_DATE('${dateString}', '${dateFormat}'), `;
        continue;
      }

      switch (typeof data[key]) {
        case "string":
          let value = data[key] as string;
          updateStatement += `${key}=q'[${value}]', `;
          break;
        case "number":
          updateStatement += `${key}=${data[key]}, `;
          break;
      }
    }

    updateStatement = updateStatement.slice(0, -2);
    updateStatement += ` WHERE ${pk_name}=${pk_val};`;

    return updateStatement;
  }

  private appendErrorHandling(sqlStatement: string, tableName: string, operation: string): string {
    const openedLine = sqlStatement.slice(0, -1);
    return `${openedLine} LOG ERRORS INTO ${tableName.toUpperCase()}('${operation}') REJECT LIMIT UNLIMITED;`;
  }

  writeCurrentBatch(): void {
    const outputDir = 'output_sql';
    const filePath = path.join(outputDir, this.filename);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const content = this.batchSqlStatement.join('\n');
    fs.appendFileSync(filePath, content + '\n');

    this.batchSqlStatement = [];
    this.batchCount = 0;
  }
}
