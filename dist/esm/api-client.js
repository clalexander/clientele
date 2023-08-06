/* eslint-disable max-classes-per-file */
import axios from 'axios';
import { ApiError, BadGatewayApiError, GatewayTimeoutApiError, InternalServerApiError, NetworkApiError, TimeoutApiError, } from './api-error';
// must export for type declarations
export class ApiClientBase {
    client;
    maxRetries;
    apiErrorInterceptor;
    constructor(options) {
        const { maxRetries = 0, apiErrorInterceptor, ...axiosCreateOptions } = options || {};
        this.client = axios.create(axiosCreateOptions);
        this.maxRetries = maxRetries;
        this.apiErrorInterceptor = apiErrorInterceptor;
        // add standard error interceptor
        this.client.interceptors.response.use(undefined, this.responseErrorInterceptorClosure);
    }
    async responseErrorInterceptor(error) {
        const config = ({ ...error.config });
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
    responseErrorInterceptorClosure = (error) => this.responseErrorInterceptor(error);
    async makeRequest(options, baseBath) {
        const { path, ...remainingOptions } = options;
        const url = this.buildPath(path, baseBath);
        const requestOptions = {
            ...remainingOptions,
            url,
        };
        const response = await this.client.request(requestOptions);
        return response.data;
    }
    buildPath(path, basePath) {
        const pathParts = path ? (Array.isArray(path) ? path : [path]) : [];
        if (basePath) {
            pathParts.unshift(basePath);
        }
        return pathParts.join('/').replace(/\/{2,}/g, '/');
    }
    resourceMakeRequest(path) {
        return (options) => this.makeRequest(options, path);
    }
    makeResource(module) {
        return module.components({
            makeRequest: this.resourceMakeRequest(module.path),
        });
    }
}
export function ApiClient(modules) {
    class Class extends ApiClientBase {
        constructor(options) {
            super(options);
            const resources = Object.entries(modules).reduce((acc, [key, module]) => ({
                ...acc,
                [key]: this.makeResource(module),
            }), {});
            Object.assign(this, resources);
            Object.freeze(this);
        }
    }
    return Class;
}
