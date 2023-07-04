/* eslint-disable max-classes-per-file */
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  CreateAxiosDefaults,
} from 'axios';
import {
  ApiError,
  BadGatewayApiError,
  GatewayTimeoutApiError,
  InternalServerApiError,
  NetworkApiError,
  TimeoutApiError,
} from './api-error';
import { Constructor } from './utility-types';

export interface ApiRequestOptions<D = any> extends AxiosRequestConfig<D> {
  path?: unknown | unknown[],
  preventRetry?: boolean;
}

interface ApiRequestInternalOptions extends ApiRequestOptions {
  retries?: number;
}

type Promisable<T> = Promise<T> | T;

export type ApiMakeRequest<T = any, O = any> = (options: ApiRequestOptions & O) => Promisable<T>;

export interface ApiModuleMethodsOptions<O = any> {
  makeRequest: ApiMakeRequest<any, O>;
}

export type ApiResource = Record<string, any>;
export type ApiResources = Record<string, ApiResource>;

export type ApiModule<T extends ApiResource, O = any> = {
  path?: string;
  methods: (options: ApiModuleMethodsOptions<O>) => T;
};

export type ApiModules<T extends ApiResources> = {
  [K in keyof T]: ApiModule<T[K]>;
};

type UnwrapApiResources<T> = T extends ApiModules<infer Type> ? Type : never;

export type ApiErrorInterceptor = (
  error: ApiError,
  config: ApiRequestOptions,
) => Promisable<boolean | void>;
// HERE
export interface ApiClientOptions extends CreateAxiosDefaults {
  maxRetries?: number;
  apiErrorInterceptor?: ApiErrorInterceptor;
}

// must export for type declarations
export class ApiClientBase {
  protected client: AxiosInstance;

  private maxRetries: number;

  private apiErrorInterceptor?: ApiErrorInterceptor;

  constructor(options?: ApiClientOptions) {
    const {
      maxRetries = 0,
      apiErrorInterceptor,
      ...axiosCreateOptions
    } = options || {};
    this.client = axios.create(axiosCreateOptions);
    this.maxRetries = maxRetries;
    this.apiErrorInterceptor = apiErrorInterceptor;
    // add standard error interceptor
    this.client.interceptors.response.use(
      undefined,
      this.responseErrorInterceptorClosure,
    );
  }

  protected async responseErrorInterceptor(error: AxiosError): Promise<any> {
    const config = ({ ...error.config }) as ApiRequestInternalOptions;
    let maybeRetry = false;
    const apiError = ApiError.generate(error);
    switch (apiError.constructor) {
      case InternalServerApiError:
      case BadGatewayApiError:
      case GatewayTimeoutApiError:
      case NetworkApiError:
      case TimeoutApiError:
        maybeRetry = true;
        break;
      default:
        break;
    }
    // call custom error interceptor
    if (this.apiErrorInterceptor) {
      const errorRetry = await this.apiErrorInterceptor(apiError, config);
      if (errorRetry !== undefined) {
        maybeRetry = errorRetry;
      }
    }
    // retry flag
    const retry = maybeRetry && !config.preventRetry && (config.retries || 0) < this.maxRetries;
    // maybe retry request
    if (retry) {
      // update config
      const retryConfig = {
        ...config,
        retries: config.retries || 1,
      };
      // retry
      return this.client(retryConfig);
    }
    // throw error
    throw apiError;
  }

  private responseErrorInterceptorClosure = (error: any) => this.responseErrorInterceptor(error);

  protected async makeRequest<T>(options: ApiRequestOptions, baseBath?: string): Promise<T> {
    const { path, ...remainingOptions } = options;
    const url = this.buildPath(path, baseBath);
    const requestOptions = {
      ...remainingOptions,
      url,
    };
    const response = await this.client.request(requestOptions);
    return response.data;
  }

  protected buildPath(path?: unknown | unknown[], basePath?: string): string {
    const pathParts = path ? (Array.isArray(path) ? path : [path]) : [];
    if (basePath) {
      pathParts.unshift(basePath);
    }
    return pathParts.join('/');
  }

  protected resourceMakeRequest(path?: string): ApiMakeRequest {
    return (options: ApiRequestOptions) => this.makeRequest(options, path);
  }

  protected makeResource<T extends ApiResource>(module: ApiModule<T>): T {
    return module.methods({
      makeRequest: this.resourceMakeRequest(module.path),
    });
  }
}

export function ApiClient<T extends ApiModules<ApiResources>>(
  modules: T,
): Constructor<ApiClientBase & UnwrapApiResources<T>, ApiClientOptions> {
  abstract class Class extends ApiClientBase {
    constructor(options: ApiClientOptions) {
      super(options);
      const resources = Object.entries(modules).reduce((acc, [key, module]) => ({
        ...acc,
        [key]: this.makeResource(module),
      }), {});
      Object.assign(this, resources);
      Object.freeze(this);
    }
  }
  return Class as Constructor<ApiClientBase & UnwrapApiResources<T>, ApiClientOptions>;
}
