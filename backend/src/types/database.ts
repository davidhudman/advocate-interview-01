export interface DbSchema {
  name: string;
  type: string;
  notnull: number;
  default_value: any;
  pk: number;
}

export interface DbTableInfo {
  schema: DbSchema[];
  recordCount: number;
  records: Record<string, any>[];
}

export interface DbEnvironmentInfo {
  environment?: string;
  filename: string;
  tables: Record<string, DbTableInfo>;
}

export interface DbInfoResponse {
  [environment: string]: DbEnvironmentInfo;
}

export interface SqliteTable {
  name: string;
}

// Add this interface for SQLite connections
export interface SQLiteConnectionConfig {
  filename: string;
  [key: string]: any;
}

// Update existing code to use this type
export type ConnectionConfig = SQLiteConnectionConfig | string;
