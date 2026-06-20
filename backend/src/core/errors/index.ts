import i18next from '../../server/utils/i18n';

/**
 * Enum representing HTTP status codes.
 */
export enum HttpStatus {
  Ok = 200,
  Created = 201,
  Accepted = 202,
  NonAuthoritativeInformation = 203,
  NoContent = 204,
  ResetContent = 205,
  PartialContent = 206,
  MultipleChoices = 300,
  MovedPermanently = 301,
  Found = 302,
  SeeOther = 303,
  NotModified = 304,
  UseProxy = 305,
  Unused = 306,
  TemporaryRedirect = 307,
  BadRequest = 400,
  Unauthorized = 401,
  PaymentRequired = 402,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  NotAcceptable = 406,
  ProxyAuthenticationRequired = 407,
  RequestTimeout = 408,
  Conflict = 409,
  Gone = 410,
  LengthRequired = 411,
  PreconditionRequired = 412,
  RequestEntryTooLarge = 413,
  RequestURITooLong = 414,
  UnsupportedMediaType = 415,
  RequestedRangeNotSatisfiable = 416,
  ExpectationFailed = 417,
  ImATeapot = 418,
  TooManyRequests = 429,
  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
  HTTPVersionNotSupported = 505,
}

/**
 * Class representing an API error.
 * @extends Error
 * @property {number} code - The HTTP status code for the error.
 * @property {string} status - The status of the error.
 * @property {string} message - The error message.
 */
export class ApiError extends Error {
  public code: HttpStatus = HttpStatus.InternalServerError;
  public status: string;

  /**
   * Creates an instance of ApiError.
   * @param key - The key for the error message.
   * @param code - The HTTP status code for the error.
   */
  constructor(key: string, code: number) {
    // Get the error message from the i18n translation.
    const message = i18next.t(key).toString();
    super(message);
    this.code = code;
    this.status = 'error';
  }

  static invalidPhoneCredentials(): ApiError {
    return new ApiError('invalidPhoneCredentials', HttpStatus.Forbidden);
  }

  static loginRateLimit(): ApiError {
    return new ApiError('loginRateLimit', HttpStatus.TooManyRequests);
  }

  static signupRateLimit(): ApiError {
    return new ApiError('signupRateLimit', HttpStatus.TooManyRequests);
  }

  static notAllowed(): ApiError {
    return new ApiError('notAllowed', HttpStatus.BadRequest);
  }

  static rateLimitExceeded(): ApiError {
    return new ApiError('rateLimitExceeded', HttpStatus.TooManyRequests);
  }

  static passwordResetRateLimit(): ApiError {
    return new ApiError('passwordResetRateLimit', HttpStatus.TooManyRequests);
  }

  static invalidOTP(): ApiError {
    return new ApiError('invalidOTP', HttpStatus.Forbidden);
  }

  static unauthorized(): ApiError {
    return new ApiError('unauthorized', HttpStatus.Unauthorized);
  }

  static invalidAccessToken(): ApiError {
    return new ApiError('invalidAccessToken', HttpStatus.Unauthorized);
  }

  static invalidRefreshToken(): ApiError {
    return new ApiError('invalidRefreshToken', HttpStatus.Unauthorized);
  }

  static invalidRegisterToken(): ApiError {
    return new ApiError('invalidRegisterToken', HttpStatus.Unauthorized);
  }

  static BannedUserToken(): ApiError {
    return new ApiError('BannedUserToken', HttpStatus.Unauthorized);
  }

  static invalidEmailCredentials(): ApiError {
    return new ApiError('invalidEmailCredentials', HttpStatus.Forbidden);
  }

  static pleaseTryAgain(): ApiError {
    return new ApiError('pleaseTryAgain', HttpStatus.BadRequest);
  }

  static tryAgain(): ApiError {
    return new ApiError('tryAgain', HttpStatus.BadRequest);
  }

  static invalidOldPassword(): ApiError {
    return new ApiError('invalidOldPassword', HttpStatus.BadRequest);
  }

  static notMatchPassword(): ApiError {
    return new ApiError('notMatchPassword', HttpStatus.BadRequest);
  }

  static duplicateAdmin(): ApiError {
    return new ApiError('duplicateAdmin', HttpStatus.BadRequest);
  }

  static notFoundAdmin(): ApiError {
    return new ApiError('notFoundAdmin', HttpStatus.NotFound);
  }

  static notFoundUser(): ApiError {
    return new ApiError('notFoundUser', HttpStatus.NotFound);
  }

  static duplicateUser(): ApiError {
    return new ApiError('duplicateUser', HttpStatus.BadRequest);
  }

  static duplicateMail(): ApiError {
    return new ApiError('duplicateMail', HttpStatus.BadRequest);
  }

  static UserAccountMustDeleted(): ApiError {
    return new ApiError('UserAccountMustDeleted', HttpStatus.BadRequest);
  }

  static UserAccountMustActive(): ApiError {
    return new ApiError('UserAccountMustActive', HttpStatus.BadRequest);
  }

  static UserDeleteAccount(): ApiError {
    return new ApiError('UserDeleteAccount', HttpStatus.BadRequest);
  }

  static notFoundCategory(): ApiError {
    return new ApiError('notFoundCategory', HttpStatus.NotFound);
  }

  static notFoundBrand(): ApiError {
    return new ApiError('notFoundBrand', HttpStatus.NotFound);
  }

  static invalidBranchIndex(): ApiError {
    return new ApiError('invalidBranchIndex', HttpStatus.NotFound);
  }

  static duplicateProvider(): ApiError {
    return new ApiError('duplicateProvider', HttpStatus.NotFound);
  }

  static notFoundProvider(): ApiError {
    return new ApiError('notFoundProvider', HttpStatus.NotFound);
  }

  static notFoundDevice(): ApiError {
    return new ApiError('notFoundDevice', HttpStatus.NotFound);
  }

  static notFoundRepairRequest(): ApiError {
    return new ApiError('notFoundRepairRequest', HttpStatus.NotFound);
  }

  static notFoundBrandOffer(): ApiError {
    return new ApiError('notFoundBrandOffer', HttpStatus.NotFound);
  }

  static duplicateBrandOffer(): ApiError {
    return new ApiError('duplicateBrandOffer', HttpStatus.BadRequest);
  }

  static notFoundInspection(): ApiError {
    return new ApiError('notFoundInspection', HttpStatus.NotFound);
  }

  static duplicateInspection(): ApiError {
    return new ApiError('duplicateInspection', HttpStatus.BadRequest);
  }

  static notFoundPayment(): ApiError {
    return new ApiError('notFoundPayment', HttpStatus.NotFound);
  }

  static notFoundChatSession(): ApiError {
    return new ApiError('notFoundChatSession', HttpStatus.NotFound);
  }

  static repairRequestAlreadyCancelled(): ApiError {
    return new ApiError('repairRequestAlreadyCancelled', HttpStatus.BadRequest);
  }

  static invalidRepairRequestStatus(): ApiError {
    return new ApiError('invalidRepairRequestStatus', HttpStatus.BadRequest);
  }

  static offerAlreadyResponded(): ApiError {
    return new ApiError('offerAlreadyResponded', HttpStatus.BadRequest);
  }

  static duplicateBrandReview(): ApiError {
    return new ApiError('duplicateBrandReview', HttpStatus.BadRequest);
  }

  static cannotReviewUncompletedRequest(): ApiError {
    return new ApiError('cannotReviewUncompletedRequest', HttpStatus.BadRequest);
  }

  static notFoundBrandReview(): ApiError {
    return new ApiError('notFoundBrandReview', HttpStatus.NotFound);
  }

  static notFoundPayout(): ApiError {
    return new ApiError('notFoundPayout', HttpStatus.NotFound);
  }

  static payoutAlreadyProcessed(): ApiError {
    return new ApiError('payoutAlreadyProcessed', HttpStatus.BadRequest);
  }

  static insufficientWalletBalance(): ApiError {
    return new ApiError('insufficientWalletBalance', HttpStatus.BadRequest);
  }

  static payoutAmountTooLow(): ApiError {
    return new ApiError('payoutAmountTooLow', HttpStatus.BadRequest);
  }

  static notFoundReel(): ApiError {
    return new ApiError('notFoundReel', HttpStatus.NotFound);
  }

  static notFoundSupportTicket(): ApiError {
    return new ApiError('notFoundSupportTicket', HttpStatus.NotFound);
  }

  static notFoundSubscription(): ApiError {
    return new ApiError('notFoundSubscription', HttpStatus.NotFound);
  }

  static activeSubscriptionExists(): ApiError {
    return new ApiError('activeSubscriptionExists', HttpStatus.Conflict);
  }

  static subscriptionRequired(): ApiError {
    return new ApiError('subscriptionRequired', HttpStatus.PaymentRequired);
  }

  static subscriptionAlreadyActive(): ApiError {
    return new ApiError('subscriptionAlreadyActive', HttpStatus.BadRequest);
  }
}
