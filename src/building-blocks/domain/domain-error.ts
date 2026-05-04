/* eslint-disable @typescript-eslint/explicit-member-accessibility */
export enum DomainErrorType {
  NotFound = 'NotFound',
  AccessDenied = 'AccessDenied',
  PermissionDenied = 'PermissionDenied',
  NonUnique = 'NonUnique',
  DomainRuleViolation = 'DomainRuleViolation',
  ValidationError = 'ValidationError',
  InternalError = 'InternalError',
}

interface DomainErrorOptions extends ErrorOptions {
  data?: Record<string, any>;
}

export abstract class DomainError extends Error {
  public abstract readonly type: DomainErrorType;

  public readonly name: string;
  public data: Readonly<Record<string, any>>;
  public readonly status: number;

  constructor(
    name: string,
    message: string,
    { data, ...options }: DomainErrorOptions = {},
  ) {
    super(message, options);
    this.name = name;
    this.data = data ?? {};
  }

  getData(): Record<string, any> {
    return this.data;
  }
}

export class AccessDeniedError extends DomainError {
  public readonly type = DomainErrorType.AccessDenied;

  constructor(message: string, options: DomainErrorOptions = {}) {
    super(AccessDeniedError.name, message, options);
  }
}

export class NotFoundError extends DomainError {
  public readonly type = DomainErrorType.NotFound;

  constructor(message: string, options: DomainErrorOptions = {}) {
    super(NotFoundError.name, message, options);
  }
}

export class NonUniqueError extends DomainError {
  public readonly type = DomainErrorType.NonUnique;

  constructor(message: string, options?: DomainErrorOptions) {
    super(NonUniqueError.name, message, options);
  }
}

export class PermissionDeniedError extends DomainError {
  public readonly type = DomainErrorType.PermissionDenied;

  constructor(message: string, options?: DomainErrorOptions) {
    super(PermissionDeniedError.name, message, options);
  }
}

export class DomainRuleViolationError extends DomainError {
  public readonly type = DomainErrorType.DomainRuleViolation;

  constructor(message: string, options?: DomainErrorOptions) {
    super(DomainRuleViolationError.name, message, options);
  }
}

export class ValidationError extends DomainError {
  public readonly type = DomainErrorType.ValidationError;

  constructor(message: string, options?: DomainErrorOptions) {
    super(ValidationError.name, message, options);
  }
}

export class InternalError extends DomainError {
  public readonly type = DomainErrorType.InternalError;

  constructor(message: string, options?: DomainErrorOptions) {
    super(InternalError.name, message, options);
  }
}
