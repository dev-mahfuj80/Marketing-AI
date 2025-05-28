// This declaration file adds missing types for compatibility with Next.js generated types
declare global {
  // Define Object to prevent TypeScript errors in Next.js generated files
  type Object = object;

  // Define Function interface for compatibility
  interface Function {
    (...args: any[]): any;
  }

  // Define Promise interface
  interface Promise<T> {
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?:
        | ((value: T) => TResult1 | Promise<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | Promise<TResult2>)
        | undefined
        | null
    ): Promise<TResult1 | TResult2>;
    catch<TResult = never>(
      onrejected?:
        | ((reason: any) => TResult | Promise<TResult>)
        | undefined
        | null
    ): Promise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }

  // Define PromiseConstructor
  interface PromiseConstructor {
    readonly prototype: Promise<any>;
    new <T>(
      executor: (
        resolve: (value: T | PromiseLike<T>) => void,
        reject: (reason?: any) => void
      ) => void
    ): Promise<T>;
    all<T>(values: readonly (T | PromiseLike<T>)[]): Promise<T[]>;
    race<T>(values: readonly (T | PromiseLike<T>)[]): Promise<T>;
    reject<T = never>(reason?: any): Promise<T>;
    resolve<T>(value: T | PromiseLike<T>): Promise<T>;
    resolve(): Promise<void>;
  }

  const Promise: PromiseConstructor;

  // Add Record utility type
  type Record<K extends string | number | symbol, T> = {
    [P in K]: T;
  };

  // Add other commonly used utility types that might be missing
  type Partial<T> = { [P in keyof T]?: T[P] };
  type Required<T> = { [P in keyof T]-?: T[P] };
  type Readonly<T> = { readonly [P in keyof T]: T[P] };
  type Pick<T, K extends keyof T> = { [P in K]: T[P] };
  type Omit<T, K extends string | number | symbol> = Pick<
    T,
    Exclude<keyof T, K>
  >;
  type Exclude<T, U> = T extends U ? never : T;
  type Extract<T, U> = T extends U ? T : never;
  type NonNullable<T> = T extends null | undefined ? never : T;
  type ReturnType<T extends (...args: any[]) => any> = T extends (
    ...args: any[]
  ) => infer R
    ? R
    : any;
}

export {};
