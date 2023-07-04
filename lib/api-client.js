"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = exports.ApiClientBase = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const api_error_1 = require("./api-error");
class ApiClientBase {
    client;
    maxRetries;
    apiErrorInterceptor;
    constructor(options) {
        const { maxRetries = 0, apiErrorInterceptor, ...axiosCreateOptions } = options || {};
        this.client = axios_1.default.create(axiosCreateOptions);
        this.maxRetries = maxRetries;
        this.apiErrorInterceptor = apiErrorInterceptor;
        this.client.interceptors.response.use(undefined, this.responseErrorInterceptorClosure);
    }
    async responseErrorInterceptor(error) {
        const config = ({ ...error.config });
        let maybeRetry = false;
        const apiError = api_error_1.ApiError.generate(error);
        switch (apiError.constructor) {
            case api_error_1.InternalServerApiError:
            case api_error_1.BadGatewayApiError:
            case api_error_1.GatewayTimeoutApiError:
            case api_error_1.NetworkApiError:
            case api_error_1.TimeoutApiError:
                maybeRetry = true;
                break;
            default:
                break;
        }
        if (this.apiErrorInterceptor) {
            const errorRetry = await this.apiErrorInterceptor(apiError, config);
            if (errorRetry !== undefined) {
                maybeRetry = errorRetry;
            }
        }
        const retry = maybeRetry && !config.preventRetry && (config.retries || 0) < this.maxRetries;
        if (retry) {
            const retryConfig = {
                ...config,
                retries: config.retries || 1,
            };
            return this.client(retryConfig);
        }
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
        return pathParts.join('/');
    }
    resourceMakeRequest(path) {
        return (options) => this.makeRequest(options, path);
    }
    makeResource(module) {
        return module.methods({
            makeRequest: this.resourceMakeRequest(module.path),
        });
    }
}
exports.ApiClientBase = ApiClientBase;
function ApiClient(modules) {
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
exports.ApiClient = ApiClient;
