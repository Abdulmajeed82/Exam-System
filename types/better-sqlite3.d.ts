declare module 'better-sqlite3' {
  type Params = any[] | object;

  interface Options {
    readonly readonly?: boolean;
    readonly fileMustExist?: boolean;
    readonly memory?: boolean;
    readonly verbose?: (message?: any) => void;
  }

  class Statement {
    constructor();
    run(...params: Params): any;
    get(...params: Params): any;
    all(...params: Params): any[];
    iterate(...params: Params): IterableIterator<any>;
    raw(...params: Params): any[];
    columns(): { name: string }[];
    bind(...params: Params): Statement;
    finalize(): void;
  }

  class Database {
    constructor(filename?: string, options?: Options);
    prepare(sql: string): Statement;
    transaction<T extends (...args: any[]) => any>(fn: T): T;
    exec(sql: string): void;
    pragma(statement: string, ...args: any[]): any;
    close(): void;
    defaultSafeIntegers: boolean;
  }

  export default Database;
}
