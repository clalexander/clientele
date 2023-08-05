"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = exports.ApiClientBase = void 0;
/* eslint-disable max-classes-per-file */
const axios_1 = __importDefault(require("axios"));
const api_error_1 = require("./api-error");
// must export for type declarations
class ApiClientBase {
    constructor(options) {
        this.responseErrorInterceptorClosure = (error) => this.responseErrorInterceptor(error);
        const _a = options || {}, { maxRetries = 0, apiErrorInterceptor } = _a, axiosCreateOptions = __rest(_a, ["maxRetries", "apiErrorInterceptor"]);
        this.client = axios_1.default.create(axiosCreateOptions);
        this.maxRetries = maxRetries;
        this.apiErrorInterceptor = apiErrorInterceptor;
        // add standard error interceptor
        this.client.interceptors.response.use(undefined, this.responseErrorInterceptorClosure);
    }
    responseErrorInterceptor(error) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = (Object.assign({}, error.config));
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
            // call custom error interceptor
            if (this.apiErrorInterceptor) {
                const errorRetry = yield this.apiErrorInterceptor(apiError, config);
                if (errorRetry !== undefined) {
                    maybeRetry = errorRetry;
                }
            }
            // retry flag
            const retry = maybeRetry && !config.preventRetry && (config.retries || 0) < this.maxRetries;
            // maybe retry request
            if (retry) {
                // update config
                const retryConfig = Object.assign(Object.assign({}, config), { retries: config.retries || 1 });
                // retry
                return this.client(retryConfig);
            }
            // throw error
            throw apiError;
        });
    }
    makeRequest(options, baseBath) {
        return __awaiter(this, void 0, void 0, function* () {
            const { path } = options, remainingOptions = __rest(options, ["path"]);
            const url = this.buildPath(path, baseBath);
            const requestOptions = Object.assign(Object.assign({}, remainingOptions), { url });
            const response = yield this.client.request(requestOptions);
            return response.data;
        });
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
exports.ApiClientBase = ApiClientBase;
function ApiClient(modules) {
    class Class extends ApiClientBase {
        constructor(options) {
            super(options);
            const resources = Object.entries(modules).reduce((acc, [key, module]) => (Object.assign(Object.assign({}, acc), { [key]: this.makeResource(module) })), {});
            Object.assign(this, resources);
            Object.freeze(this);
        }
    }
    return Class;
}
exports.ApiClient = ApiClient;
