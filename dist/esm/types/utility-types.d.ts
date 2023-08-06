export type Arguments<T = any[]> = T extends Array<any> ? T : [T];
export type Constructor<T = any, A = any[]> = new (...args: Arguments<A>) => T;
export type Promisable<T> = Promise<T> | T;
//# sourceMappingURL=utility-types.d.ts.map