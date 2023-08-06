import { AxiosError, AxiosResponse } from 'axios';
export declare class ApiError<T = unknown, D = any> extends Error {
    readonly raw: AxiosError<T, D>;
    readonly type: string;
    readonly code?: string;
    readonly request?: any;
    readonly response?: AxiosResponse<T, D>;
    constructor(raw: AxiosError<T, D>);
    static generate<T = unknown, D = any>(rawError: AxiosError<T, D>): ApiError<T, D>;
}
export declare class BadRequestApiError<T = unknown, D = any> extends ApiError<T, D> {
}
export declare class UnauthorizedApiError<T = unknown, D = any> extends ApiError<T, D> {
}
export declare class ForbiddenApiError<T = unknown, D = any> extends ApiError<T, D> {
}
export declare class NotFoundApiError<T = unknown, D = any> extends ApiError<T, D> {
}
export declare class ConflictApiError<T = unknown, D = any> extends ApiError<T, D> {
}
export declare class InternalServerApiError<T = unknown, D = any> extends ApiError<T, D> {
}
export declare class BadGatewayApiError<T = unknown, D = any> extends ApiError<T, D> {
}
export declare class GatewayTimeoutApiError<T = unknown, D = any> extends ApiError<T, D> {
}
export declare class TooManyRedirectsApiError<T = unknown, D = any> extends ApiError<T, D> {
}
export declare class BadOptionApiError<T = unknown, D = any> extends ApiError<T, D> {
}
export declare class NetworkApiError<T = unknown, D = any> extends ApiError<T, D> {
}
export declare class DeprecatedApiError<T = unknown, D = any> extends ApiError<T, D> {
}
export declare class BadResponseApiError<T = unknown, D = any> extends ApiError<T, D> {
}
export declare class InvalidURLApiError<T = unknown, D = any> extends ApiError<T, D> {
}
export declare class CanceledApiError<T = unknown, D = any> extends ApiError<T, D> {
}
export declare class ConnectionAbortedApiError<T = unknown, D = any> extends ApiError<T, D> {
}
export declare class TimeoutApiError<T = unknown, D = any> extends ApiError<T, D> {
}
export declare class UnknownApiError<T = unknown, D = any> extends ApiError<T, D> {
}
//# sourceMappingURL=api-error.d.ts.map