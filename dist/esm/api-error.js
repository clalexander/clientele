/* eslint-disable max-classes-per-file */
import { AxiosError, HttpStatusCode } from 'axios';
export class ApiError extends Error {
    raw;
    type;
    code;
    request;
    response;
    constructor(raw) {
        super(raw.message);
        this.raw = raw;
        this.type = this.constructor.name;
        this.code = raw.code;
        this.request = raw.request;
        this.response = raw.response;
    }
    static generate(rawError) {
        if (rawError.response) {
            switch (rawError.response.status) {
                case HttpStatusCode.BadRequest:
                    return new BadRequestApiError(rawError);
                case HttpStatusCode.Unauthorized:
                    return new UnauthorizedApiError(rawError);
                case HttpStatusCode.Forbidden:
                    return new ForbiddenApiError(rawError);
                case HttpStatusCode.NotFound:
                    return new NotFoundApiError(rawError);
                case HttpStatusCode.Conflict:
                    return new ConflictApiError(rawError);
                case HttpStatusCode.InternalServerError:
                    return new InternalServerApiError(rawError);
                case HttpStatusCode.BadGateway:
                    return new BadGatewayApiError(rawError);
                case HttpStatusCode.GatewayTimeout:
                    return new GatewayTimeoutApiError(rawError);
                default:
                    break;
            }
        }
        else if (rawError.request) {
            switch (rawError.code) {
                case AxiosError.ERR_FR_TOO_MANY_REDIRECTS:
                    return new TooManyRedirectsApiError(rawError);
                case AxiosError.ERR_BAD_OPTION_VALUE:
                case AxiosError.ERR_BAD_OPTION:
                    return new BadOptionApiError(rawError);
                case AxiosError.ERR_NETWORK:
                    return new NetworkApiError(rawError);
                case AxiosError.ERR_DEPRECATED:
                    return new DeprecatedApiError(rawError);
                case AxiosError.ERR_BAD_RESPONSE:
                    return new BadResponseApiError(rawError);
                case AxiosError.ERR_INVALID_URL:
                    return new InvalidURLApiError(rawError);
                case AxiosError.ERR_CANCELED:
                    return new CanceledApiError(rawError);
                case AxiosError.ECONNABORTED:
                    return new ConnectionAbortedApiError(rawError);
                case AxiosError.ETIMEDOUT:
                    return new TimeoutApiError(rawError);
                default:
                    break;
            }
        }
        return new UnknownApiError(rawError);
    }
}
export class BadRequestApiError extends ApiError {
}
export class UnauthorizedApiError extends ApiError {
}
export class ForbiddenApiError extends ApiError {
}
export class NotFoundApiError extends ApiError {
}
export class ConflictApiError extends ApiError {
}
export class InternalServerApiError extends ApiError {
}
export class BadGatewayApiError extends ApiError {
}
export class GatewayTimeoutApiError extends ApiError {
}
export class TooManyRedirectsApiError extends ApiError {
}
export class BadOptionApiError extends ApiError {
}
export class NetworkApiError extends ApiError {
}
export class DeprecatedApiError extends ApiError {
}
export class BadResponseApiError extends ApiError {
}
export class InvalidURLApiError extends ApiError {
}
export class CanceledApiError extends ApiError {
}
export class ConnectionAbortedApiError extends ApiError {
}
export class TimeoutApiError extends ApiError {
}
export class UnknownApiError extends ApiError {
}
