import { AxiosError, AxiosInstance, AxiosRequestConfig, CreateAxiosDefaults } from 'axios';
import { ApiError } from './api-error';
type Arguments<T = any[]> = T extends Array<any> ? T : [T];
type Constructor<T = any, A = any[]> = new (...args: Arguments<A>) => T;
type Promisable<T> = Promise<T> | T;
export interface ApiRequestOptions<T = any> extends AxiosRequestConfig<T> {
    path?: unknown | unknown[];
    preventRetry?: boolean;
}
export type ApiMakeRequest<T = any, O = any> = (options: ApiRequestOptions & O) => Promisable<T>;
export interface ApiModuleComponentsOptions<O = any> {
    makeRequest: ApiMakeRequest<any, O>;
}
export type ApiResource = Record<string, any>;
export type ApiResources = Record<string, ApiResource>;
export type ApiModule<T extends ApiResource, O = any> = {
    path?: string;
    components: (options: ApiModuleComponentsOptions<O>) => T;
};
export type ApiModules<T extends ApiResources> = {
    [K in keyof T]: ApiModule<T[K]>;
};
export type ApiErrorInterceptor = (error: ApiError, config: ApiRequestOptions) => Promisable<boolean | void>;
export interface ApiClientOptions extends CreateAxiosDefaults {
    maxRetries?: number;
    apiErrorInterceptor?: ApiErrorInterceptor;
}
export declare class ApiClientBase {
    protected client: AxiosInstance;
    private maxRetries;
    private apiErrorInterceptor?;
    constructor(options?: ApiClientOptions);
    protected responseErrorInterceptor(error: AxiosError): Promise<any>;
    private responseErrorInterceptorClosure;
    protected makeRequest<T>(options: ApiRequestOptions, baseBath?: string): Promise<T>;
    protected buildPath(path?: unknown | unknown[], basePath?: string): string;
    protected resourceMakeRequest(path?: string): ApiMakeRequest;
    protected makeResource<T extends ApiResource>(module: ApiModule<T>): T;
}
type UnwrapApiResources<T> = T extends ApiModules<infer Type> ? Type : never;
export declare function ApiClient<T extends ApiModules<ApiResources>>(modules: T): Constructor<ApiClientBase & UnwrapApiResources<T>, ApiClientOptions>;
export {};
//# sourceMappingURL=api-client.d.ts.map