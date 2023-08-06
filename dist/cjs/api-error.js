"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownApiError = exports.TimeoutApiError = exports.ConnectionAbortedApiError = exports.CanceledApiError = exports.InvalidURLApiError = exports.BadResponseApiError = exports.DeprecatedApiError = exports.NetworkApiError = exports.BadOptionApiError = exports.TooManyRedirectsApiError = exports.GatewayTimeoutApiError = exports.BadGatewayApiError = exports.InternalServerApiError = exports.ConflictApiError = exports.NotFoundApiError = exports.ForbiddenApiError = exports.UnauthorizedApiError = exports.BadRequestApiError = exports.ApiError = void 0;
/* eslint-disable max-classes-per-file */
const axios_1 = require("axios");
class ApiError extends Error {
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
                case axios_1.HttpStatusCode.BadRequest:
                    return new BadRequestApiError(rawError);
                case axios_1.HttpStatusCode.Unauthorized:
                    return new UnauthorizedApiError(rawError);
                case axios_1.HttpStatusCode.Forbidden:
                    return new ForbiddenApiError(rawError);
                case axios_1.HttpStatusCode.NotFound:
                    return new NotFoundApiError(rawError);
                case axios_1.HttpStatusCode.Conflict:
                    return new ConflictApiError(rawError);
                case axios_1.HttpStatusCode.InternalServerError:
                    return new InternalServerApiError(rawError);
                case axios_1.HttpStatusCode.BadGateway:
                    return new BadGatewayApiError(rawError);
                case axios_1.HttpStatusCode.GatewayTimeout:
                    return new GatewayTimeoutApiError(rawError);
                default:
                    break;
            }
        }
        else if (rawError.request) {
            switch (rawError.code) {
                case axios_1.AxiosError.ERR_FR_TOO_MANY_REDIRECTS:
                    return new TooManyRedirectsApiError(rawError);
                case axios_1.AxiosError.ERR_BAD_OPTION_VALUE:
                case axios_1.AxiosError.ERR_BAD_OPTION:
                    return new BadOptionApiError(rawError);
                case axios_1.AxiosError.ERR_NETWORK:
                    return new NetworkApiError(rawError);
                case axios_1.AxiosError.ERR_DEPRECATED:
                    return new DeprecatedApiError(rawError);
                case axios_1.AxiosError.ERR_BAD_RESPONSE:
                    return new BadResponseApiError(rawError);
                case axios_1.AxiosError.ERR_INVALID_URL:
                    return new InvalidURLApiError(rawError);
                case axios_1.AxiosError.ERR_CANCELED:
                    return new CanceledApiError(rawError);
                case axios_1.AxiosError.ECONNABORTED:
                    return new ConnectionAbortedApiError(rawError);
                case axios_1.AxiosError.ETIMEDOUT:
                    return new TimeoutApiError(rawError);
                default:
                    break;
            }
        }
        return new UnknownApiError(rawError);
    }
}
exports.ApiError = ApiError;
class BadRequestApiError extends ApiError {
}
exports.BadRequestApiError = BadRequestApiError;
class UnauthorizedApiError extends ApiError {
}
exports.UnauthorizedApiError = UnauthorizedApiError;
class ForbiddenApiError extends ApiError {
}
exports.ForbiddenApiError = ForbiddenApiError;
class NotFoundApiError extends ApiError {
}
exports.NotFoundApiError = NotFoundApiError;
class ConflictApiError extends ApiError {
}
exports.ConflictApiError = ConflictApiError;
class InternalServerApiError extends ApiError {
}
exports.InternalServerApiError = InternalServerApiError;
class BadGatewayApiError extends ApiError {
}
exports.BadGatewayApiError = BadGatewayApiError;
class GatewayTimeoutApiError extends ApiError {
}
exports.GatewayTimeoutApiError = GatewayTimeoutApiError;
class TooManyRedirectsApiError extends ApiError {
}
exports.TooManyRedirectsApiError = TooManyRedirectsApiError;
class BadOptionApiError extends ApiError {
}
exports.BadOptionApiError = BadOptionApiError;
class NetworkApiError extends ApiError {
}
exports.NetworkApiError = NetworkApiError;
class DeprecatedApiError extends ApiError {
}
exports.DeprecatedApiError = DeprecatedApiError;
class BadResponseApiError extends ApiError {
}
exports.BadResponseApiError = BadResponseApiError;
class InvalidURLApiError extends ApiError {
}
exports.InvalidURLApiError = InvalidURLApiError;
class CanceledApiError extends ApiError {
}
exports.CanceledApiError = CanceledApiError;
class ConnectionAbortedApiError extends ApiError {
}
exports.ConnectionAbortedApiError = ConnectionAbortedApiError;
class TimeoutApiError extends ApiError {
}
exports.TimeoutApiError = TimeoutApiError;
class UnknownApiError extends ApiError {
}
exports.UnknownApiError = UnknownApiError;
